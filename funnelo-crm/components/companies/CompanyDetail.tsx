"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Globe, MoreHorizontal, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityTimeline } from "@/components/activities/ActivityTimeline";
import { ContactFormDialog } from "@/components/contacts/ContactFormDialog";
import { ConfirmDialog } from "@/components/crm/ConfirmDialog";
import {
  BackLink,
  DetailCard,
  DetailRow,
  DetailSkeleton,
  NotFoundCard,
} from "@/components/crm/DetailBits";
import { PersonLabel } from "@/components/crm/PersonAvatar";
import { StageBadge } from "@/components/crm/StageBadge";
import { DealFormDialog } from "@/components/deals/DealFormDialog";
import { useMe } from "@/components/providers/MeProvider";
import { useCrmMutation } from "@/hooks/useCrmMutation";
import { useStageMap, useTeamMap } from "@/hooks/useTeam";
import { deleteCompany } from "@/lib/data/companies";
import { formatMoney, formatMoneyCompact } from "@/lib/format";
import { canEdit } from "@/lib/permissions";
import {
  companyOptions,
  contactsByCompanyOptions,
  dealsByCompanyOptions,
} from "@/lib/query/options";
import { CompanyFormDialog } from "./CompanyFormDialog";

export function CompanyDetail({ id }: { id: string }) {
  const me = useMe();
  const router = useRouter();
  const team = useTeamMap();
  const stages = useStageMap();
  const { data: company, isPending, isError } = useQuery(companyOptions(id));
  const { data: contacts = [] } = useQuery(contactsByCompanyOptions(id));
  const { data: deals = [] } = useQuery(dealsByCompanyOptions(id));
  const [dialog, setDialog] = useState<"edit" | "delete" | "contact" | "deal" | null>(null);

  const remove = useCrmMutation({
    mutationFn: (db) => deleteCompany(db, id),
    entity: "companies",
    success: "Company deleted",
    refetch: false,
  });

  if (isPending) return <DetailSkeleton />;
  if (isError || !company)
    return <NotFoundCard backHref="/companies" backLabel="Back to companies" what="company" />;

  const editable = canEdit(me, company.owner_id);
  const dialogProps = (name: typeof dialog) => ({
    open: dialog === name,
    onOpenChange: (open: boolean) => setDialog(open ? name : null),
  });

  return (
    <div className="space-y-6">
      <BackLink href="/companies" label="Companies" />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {company.industry && <span>{company.industry}</span>}
            {company.domain && (
              <a
                href={`https://${company.domain}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
              >
                <Globe className="size-3.5" /> {company.domain}
              </a>
            )}
            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <Phone className="size-3.5" /> {company.phone}
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDialog("deal")}>
            <Plus /> Deal
          </Button>
          {editable && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-sm" aria-label="More actions" />}
              >
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setDialog("edit")}>
                  <Pencil /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => setDialog("delete")}>
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Open pipeline"
          value={formatMoney(company.open_value)}
          hint={`${company.open_deals_count} open deals`}
        />
        <Stat label="Won to date" value={formatMoney(company.won_value)} />
        <Stat label="Contacts" value={String(company.contacts_count)} />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <DetailCard title={`Deals (${deals.length})`}>
            {deals.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No deals with this company yet.
              </p>
            ) : (
              <ul className="divide-y">
                {deals.map((deal) => (
                  <li key={deal.id} className="flex items-center gap-3 py-2.5">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                    >
                      {deal.title}
                    </Link>
                    <StageBadge stage={stages?.get(deal.stage_id)} />
                    <span className="w-20 text-right text-sm tabular-nums">
                      {formatMoneyCompact(deal.value)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>

          <ActivityTimeline kind="company" id={company.id} link={{ company_id: company.id }} />
        </div>

        <div className="space-y-6">
          <DetailCard
            title="Details"
            action={
              editable && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDialog("edit")}
                  aria-label="Edit company"
                >
                  <Pencil />
                </Button>
              )
            }
          >
            <dl>
              <DetailRow label="Owner">
                <PersonLabel person={company.owner_id ? team?.get(company.owner_id) : null} />
              </DetailRow>
              <DetailRow label="Size">{company.size && `${company.size} employees`}</DetailRow>
              <DetailRow label="Location">
                {[company.city, company.country].filter(Boolean).join(", ") || null}
              </DetailRow>
            </dl>
            {company.notes && (
              <p className="mt-3 border-t pt-3 text-sm whitespace-pre-line text-muted-foreground">
                {company.notes}
              </p>
            )}
          </DetailCard>

          <DetailCard
            title={`People (${contacts.length})`}
            action={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDialog("contact")}
                aria-label="Add contact"
              >
                <Plus />
              </Button>
            }
          >
            {contacts.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">No contacts yet.</p>
            ) : (
              <ul className="divide-y">
                {contacts.map((contact) => (
                  <li key={contact.id} className="py-2">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {contact.full_name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {[contact.job_title, contact.email].filter(Boolean).join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </div>
      </div>

      <CompanyFormDialog {...dialogProps("edit")} company={company} />
      <ContactFormDialog {...dialogProps("contact")} defaultCompanyId={company.id} />
      <DealFormDialog {...dialogProps("deal")} defaults={{ company_id: company.id }} />
      <ConfirmDialog
        {...dialogProps("delete")}
        title={`Delete ${company.name}?`}
        description="Its contacts and deals stay, but lose the link to this company. This can't be undone."
        onConfirm={() => remove.mutateAsync(undefined).then(() => router.replace("/companies"))}
      />
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
