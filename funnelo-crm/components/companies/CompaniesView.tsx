"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/crm/ExportButton";
import { EmptyState, PageHeader } from "@/components/crm/PageHeader";
import { PersonLabel } from "@/components/crm/PersonAvatar";
import { SimpleSelect } from "@/components/crm/SimpleSelect";
import {
  Pagination,
  SearchInput,
  SkeletonRows,
  SortableTh,
  TableShell,
  Td,
  Th,
} from "@/components/crm/DataTable";
import { useMe } from "@/components/providers/MeProvider";
import { useListParams } from "@/hooks/useListParams";
import { useTeam, useTeamMap } from "@/hooks/useTeam";
import { fetchCompanyList } from "@/lib/data/companies";
import { EXPORT_RANGE } from "@/lib/data/shared";
import { formatMoney, formatMoneyCompact } from "@/lib/format";
import type { CompanyListParams } from "@/lib/query/keys";
import { companyListOptions, industriesOptions } from "@/lib/query/options";
import { createClient } from "@/lib/supabase/client";
import { CompanyFormDialog } from "./CompanyFormDialog";

const DEFAULTS = { page: 0, sort: "name", dir: "asc", search: "", ownerId: "", industry: "" };

export function CompaniesView() {
  const me = useMe();
  const { data: team = [] } = useTeam();
  const teamMap = useTeamMap();
  const { data: industries = [] } = useQuery(industriesOptions());
  const [raw, update] = useListParams(DEFAULTS);
  const [creating, setCreating] = useState(false);

  const params: CompanyListParams = { ...raw, dir: raw.dir === "desc" ? "desc" : "asc" };
  const { data, isPending, isPlaceholderData } = useQuery(companyListOptions(params));
  const sortProps = {
    sort: params.sort,
    dir: params.dir,
    onSort: (sort: string, dir: "asc" | "desc") => update({ sort, dir }),
  };
  const filtered = Boolean(params.search || params.ownerId || params.industry);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Companies"
        description="Accounts with their contacts and pipeline value."
        actions={
          <>
            {/* Експорт у шапці, а не в рядку фільтрів — на мобільному
                фільтри тоді ділять ширину порівну. */}
            <ExportButton
              filename="companies"
              fetchRows={async () =>
                (await fetchCompanyList(createClient(), params, EXPORT_RANGE)).rows
              }
              columns={[
                { header: "Name", value: (c) => c.name },
                { header: "Domain", value: (c) => c.domain },
                { header: "Industry", value: (c) => c.industry },
                { header: "Size", value: (c) => c.size },
                { header: "Country", value: (c) => c.country },
                { header: "City", value: (c) => c.city },
                { header: "Phone", value: (c) => c.phone },
                {
                  header: "Owner",
                  value: (c) => (c.owner_id ? teamMap?.get(c.owner_id)?.full_name : ""),
                },
                { header: "Contacts", value: (c) => c.contacts_count },
                { header: "Open pipeline (USD)", value: (c) => c.open_value },
                { header: "Won (USD)", value: (c) => c.won_value },
              ]}
            />
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus /> New company
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={params.search}
          onChange={(search) => update({ search })}
          placeholder="Search name, domain, city"
        />
        <SimpleSelect
          value={params.ownerId}
          onChange={(ownerId) => update({ ownerId })}
          options={[
            { value: "", label: "All owners" },
            { value: me.user_id, label: "My companies" },
            ...team
              .filter((m) => m.is_active && m.user_id !== me.user_id)
              .map((m) => ({ value: m.user_id, label: m.full_name })),
          ]}
          placeholder="All owners"
          className="min-w-0 flex-1 sm:w-40 sm:flex-none"
        />
        <SimpleSelect
          value={params.industry}
          onChange={(industry) => update({ industry })}
          options={[
            { value: "", label: "All industries" },
            ...industries.map((i) => ({ value: i, label: i })),
          ]}
          placeholder="All industries"
          className="min-w-0 flex-1 sm:w-44 sm:flex-none"
        />
      </div>

      {data?.total === 0 ? (
        <EmptyState
          icon={<Building2 />}
          title={filtered ? "No companies match these filters" : "No companies yet"}
          description={
            filtered
              ? "Try another search or clear the filters."
              : "Add the first account you sell to."
          }
          action={
            !filtered && (
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus /> New company
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          <TableShell busy={isPlaceholderData}>
            <thead>
              <tr>
                <SortableTh label="Company" column="name" {...sortProps} />
                <SortableTh
                  label="Industry"
                  column="industry"
                  className="hidden md:table-cell"
                  {...sortProps}
                />
                <Th className="hidden lg:table-cell">Location</Th>
                <SortableTh
                  label="Contacts"
                  column="contacts_count"
                  className="hidden text-right sm:table-cell"
                  {...sortProps}
                />
                <SortableTh
                  label="Open pipeline"
                  column="open_value"
                  className="text-right"
                  {...sortProps}
                />
                <SortableTh
                  label="Won"
                  column="won_value"
                  className="hidden text-right md:table-cell"
                  {...sortProps}
                />
                <Th className="hidden xl:table-cell">Owner</Th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <SkeletonRows columns={7} />
              ) : (
                data?.rows.map((company) => (
                  <tr key={company.id} className="transition-colors hover:bg-muted/40">
                    <Td className="max-w-64">
                      <Link
                        href={`/companies/${company.id}`}
                        className="font-medium hover:underline"
                      >
                        {company.name}
                      </Link>
                      {company.domain && (
                        <p className="truncate text-xs text-muted-foreground">{company.domain}</p>
                      )}
                    </Td>
                    <Td className="hidden text-muted-foreground md:table-cell">
                      {company.industry ?? "—"}
                    </Td>
                    <Td className="hidden text-muted-foreground lg:table-cell">
                      {[company.city, company.country].filter(Boolean).join(", ") || "—"}
                    </Td>
                    <Td className="hidden text-right tabular-nums sm:table-cell">
                      {company.contacts_count}
                    </Td>
                    <Td className="text-right tabular-nums">
                      <span className="font-medium" title={formatMoney(company.open_value)}>
                        {formatMoneyCompact(company.open_value)}
                      </span>
                      {company.open_deals_count > 0 && (
                        <span className="block text-xs text-muted-foreground">
                          {company.open_deals_count} deal{company.open_deals_count === 1 ? "" : "s"}
                        </span>
                      )}
                    </Td>
                    <Td className="hidden text-right text-muted-foreground tabular-nums md:table-cell">
                      {formatMoneyCompact(company.won_value)}
                    </Td>
                    <Td className="hidden xl:table-cell">
                      <PersonLabel
                        person={company.owner_id ? teamMap?.get(company.owner_id) : null}
                        size="xs"
                      />
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </TableShell>
          {data && (
            <Pagination page={params.page} total={data.total} onPage={(page) => update({ page })} />
          )}
        </div>
      )}

      <CompanyFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
