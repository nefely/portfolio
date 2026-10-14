"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Mail, MoreHorizontal, Pencil, Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityTimeline } from "@/components/activities/ActivityTimeline";
import { ConfirmDialog } from "@/components/crm/ConfirmDialog";
import {
  BackLink,
  DetailCard,
  DetailRow,
  DetailSkeleton,
  NotFoundCard,
} from "@/components/crm/DetailBits";
import { PersonAvatar, PersonLabel } from "@/components/crm/PersonAvatar";
import { StageBadge } from "@/components/crm/StageBadge";
import { useMe } from "@/components/providers/MeProvider";
import { useCrmMutation } from "@/hooks/useCrmMutation";
import { useStageMap, useTeamMap } from "@/hooks/useTeam";
import { deleteContact } from "@/lib/data/contacts";
import { formatDate, formatMoneyCompact } from "@/lib/format";
import { canEdit } from "@/lib/permissions";
import { contactOptions, dealsByContactOptions } from "@/lib/query/options";
import { ContactFormDialog } from "./ContactFormDialog";

export function ContactDetail({ id }: { id: string }) {
  const me = useMe();
  const router = useRouter();
  const team = useTeamMap();
  const stages = useStageMap();
  const { data: contact, isPending, isError } = useQuery(contactOptions(id));
  const { data: deals = [] } = useQuery(dealsByContactOptions(id));
  const [dialog, setDialog] = useState<"edit" | "delete" | null>(null);

  const remove = useCrmMutation({
    mutationFn: (db) => deleteContact(db, id),
    entity: "contacts",
    success: "Contact deleted",
    refetch: false,
  });

  if (isPending) return <DetailSkeleton />;
  if (isError || !contact)
    return <NotFoundCard backHref="/contacts" backLabel="Back to contacts" what="contact" />;

  const editable = canEdit(me, contact.owner_id);
  // Аватар контакту — нейтральний; кольорові — лише для учасників команди.
  const avatar = { user_id: contact.id, full_name: contact.full_name, avatar_color: "#64748b" };

  return (
    <div className="space-y-6">
      <BackLink href="/contacts" label="Contacts" />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <PersonAvatar person={avatar} size="lg" />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{contact.full_name}</h1>
            <p className="text-sm text-muted-foreground">
              {contact.job_title}
              {contact.job_title && contact.company && " at "}
              {contact.company && (
                <Link
                  href={`/companies/${contact.company.id}`}
                  className="hover:text-foreground hover:underline"
                >
                  {contact.company.name}
                </Link>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {contact.email && (
            <Button variant="outline" size="sm" render={<a href={`mailto:${contact.email}`} />}>
              <Mail /> Email
            </Button>
          )}
          {contact.phone && (
            <Button variant="outline" size="sm" render={<a href={`tel:${contact.phone}`} />}>
              <Phone /> Call
            </Button>
          )}
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

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <ActivityTimeline
          kind="contact"
          id={contact.id}
          link={{ contact_id: contact.id, company_id: contact.company_id }}
        />

        <div className="space-y-6">
          <DetailCard title="Details">
            <dl>
              <DetailRow label="Email">
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="hover:underline">
                    {contact.email}
                  </a>
                )}
              </DetailRow>
              <DetailRow label="Phone">{contact.phone}</DetailRow>
              <DetailRow label="Owner">
                <PersonLabel person={contact.owner_id ? team?.get(contact.owner_id) : null} />
              </DetailRow>
              <DetailRow label="Added">{formatDate(contact.created_at)}</DetailRow>
            </dl>
            {contact.notes && (
              <p className="mt-3 border-t pt-3 text-sm whitespace-pre-line text-muted-foreground">
                {contact.notes}
              </p>
            )}
          </DetailCard>

          <DetailCard title={`Deals (${deals.length})`}>
            {deals.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">Not attached to any deal.</p>
            ) : (
              <ul className="divide-y">
                {deals.map((deal) => (
                  <li key={deal.id} className="space-y-1 py-2">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {deal.title}
                    </Link>
                    <div className="flex items-center justify-between gap-2">
                      <StageBadge stage={stages?.get(deal.stage_id)} />
                      <span className="text-xs tabular-nums">{formatMoneyCompact(deal.value)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </div>
      </div>

      <ContactFormDialog
        open={dialog === "edit"}
        onOpenChange={(open) => setDialog(open ? "edit" : null)}
        contact={contact}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(open) => setDialog(open ? "delete" : null)}
        title={`Delete ${contact.full_name}?`}
        description="Deals and activities stay, but lose the link to this person. This can't be undone."
        onConfirm={() => remove.mutateAsync(undefined).then(() => router.replace("/contacts"))}
      />
    </div>
  );
}
