"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
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
import { fetchContactList } from "@/lib/data/contacts";
import { EXPORT_RANGE } from "@/lib/data/shared";
import type { ContactListParams } from "@/lib/query/keys";
import { contactListOptions } from "@/lib/query/options";
import { createClient } from "@/lib/supabase/client";
import { ContactFormDialog } from "./ContactFormDialog";

const DEFAULTS = { page: 0, sort: "full_name", dir: "asc", search: "", ownerId: "" };

export function ContactsView() {
  const me = useMe();
  const { data: team = [] } = useTeam();
  const teamMap = useTeamMap();
  const [raw, update] = useListParams(DEFAULTS);
  const [creating, setCreating] = useState(false);

  const params: ContactListParams = { ...raw, dir: raw.dir === "desc" ? "desc" : "asc" };
  const { data, isPending, isPlaceholderData } = useQuery(contactListOptions(params));
  const sortProps = {
    sort: params.sort,
    dir: params.dir,
    onSort: (sort: string, dir: "asc" | "desc") => update({ sort, dir }),
  };
  const filtered = Boolean(params.search || params.ownerId);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contacts"
        description="Everyone you talk to across your accounts."
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus /> New contact
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={params.search}
          onChange={(search) => update({ search })}
          placeholder="Search name, email, title"
        />
        <SimpleSelect
          value={params.ownerId}
          onChange={(ownerId) => update({ ownerId })}
          options={[
            { value: "", label: "All owners" },
            { value: me.user_id, label: "My contacts" },
            ...team
              .filter((m) => m.user_id !== me.user_id)
              .map((m) => ({ value: m.user_id, label: m.full_name })),
          ]}
          placeholder="All owners"
          className="w-40"
          size="sm"
        />
        <div className="ml-auto">
          <ExportButton
            filename="contacts"
            fetchRows={async () =>
              (await fetchContactList(createClient(), params, EXPORT_RANGE)).rows
            }
            columns={[
              { header: "First name", value: (c) => c.first_name },
              { header: "Last name", value: (c) => c.last_name },
              { header: "Email", value: (c) => c.email },
              { header: "Phone", value: (c) => c.phone },
              { header: "Job title", value: (c) => c.job_title },
              { header: "Company", value: (c) => c.company?.name },
              {
                header: "Owner",
                value: (c) => (c.owner_id ? teamMap?.get(c.owner_id)?.full_name : ""),
              },
            ]}
          />
        </div>
      </div>

      {data?.total === 0 ? (
        <EmptyState
          icon={<Users />}
          title={filtered ? "No contacts match these filters" : "No contacts yet"}
          description={
            filtered ? "Try another search or clear the filters." : "Add the people you sell to."
          }
        />
      ) : (
        <div className="space-y-3">
          <TableShell busy={isPlaceholderData}>
            <thead>
              <tr>
                <SortableTh label="Name" column="full_name" {...sortProps} />
                <SortableTh
                  label="Title"
                  column="job_title"
                  className="hidden md:table-cell"
                  {...sortProps}
                />
                <Th className="hidden sm:table-cell">Company</Th>
                <SortableTh
                  label="Email"
                  column="email"
                  className="hidden lg:table-cell"
                  {...sortProps}
                />
                <Th className="hidden xl:table-cell">Phone</Th>
                <Th className="hidden md:table-cell">Owner</Th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <SkeletonRows columns={6} />
              ) : (
                data?.rows.map((contact) => (
                  <tr key={contact.id} className="transition-colors hover:bg-muted/40">
                    <Td>
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="font-medium hover:underline"
                      >
                        {contact.full_name}
                      </Link>
                    </Td>
                    <Td className="hidden text-muted-foreground md:table-cell">
                      {contact.job_title ?? "—"}
                    </Td>
                    <Td className="hidden max-w-48 sm:table-cell">
                      {contact.company ? (
                        <Link
                          href={`/companies/${contact.company.id}`}
                          className="line-clamp-1 hover:underline"
                        >
                          {contact.company.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </Td>
                    <Td className="hidden max-w-64 lg:table-cell">
                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          className="block truncate text-muted-foreground hover:text-foreground"
                        >
                          {contact.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td className="hidden whitespace-nowrap text-muted-foreground xl:table-cell">
                      {contact.phone ?? "—"}
                    </Td>
                    <Td className="hidden md:table-cell">
                      <PersonLabel
                        person={contact.owner_id ? teamMap?.get(contact.owner_id) : null}
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

      <ContactFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
