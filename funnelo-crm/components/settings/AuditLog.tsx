"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, History } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/crm/PageHeader";
import { PersonLabel } from "@/components/crm/PersonAvatar";
import { SimpleSelect } from "@/components/crm/SimpleSelect";
import { Pagination, SkeletonRows, TableShell, Td, Th } from "@/components/crm/DataTable";
import { useListParams } from "@/hooks/useListParams";
import { useStageMap, useTeamMap } from "@/hooks/useTeam";
import { AUDIT_TABLES, describeChanges } from "@/lib/audit";
import { formatDate, formatMoney, formatRelative, formatTime } from "@/lib/format";
import { auditOptions } from "@/lib/query/options";
import { cn } from "@/lib/utils";

const ACTION_STYLE = {
  insert: { label: "Created", className: "bg-success/10 text-success" },
  update: { label: "Updated", className: "bg-primary/10 text-primary" },
  delete: { label: "Deleted", className: "bg-destructive/10 text-destructive" },
} as const;

export function AuditLog() {
  const team = useTeamMap();
  const stages = useStageMap();
  const [params, update] = useListParams({ page: 0, table: "" });
  const { data, isPending, isPlaceholderData } = useQuery(auditOptions(params.page, params.table));
  const [now] = useState(() => Date.now());

  const resolve = {
    stage: (id: string) => stages?.get(id)?.name,
    person: (id: string) => team?.get(id)?.full_name,
    money: formatMoney,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit log"
        description="Every change to deals, companies, contacts, stages and team roles. Written by the database, visible to admins only."
      />

      <SimpleSelect
        value={params.table}
        onChange={(table) => update({ table })}
        options={[
          { value: "", label: "All records" },
          ...Object.entries(AUDIT_TABLES).map(([value, meta]) => ({
            value,
            label: `${meta.label}s`,
          })),
        ]}
        placeholder="All records"
        className="w-44"
        size="sm"
      />

      {data?.total === 0 ? (
        <EmptyState icon={<History />} title="No changes recorded yet" />
      ) : (
        <div className="space-y-3">
          <TableShell busy={isPlaceholderData}>
            <thead>
              <tr>
                <Th>When</Th>
                <Th>Who</Th>
                <Th>Record</Th>
                <Th>Changes</Th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <SkeletonRows columns={4} />
              ) : (
                data?.rows.map((entry) => {
                  const table = AUDIT_TABLES[entry.table_name];
                  const action = ACTION_STYLE[entry.action];
                  const lines = describeChanges(entry, resolve);
                  return (
                    <tr key={entry.id} className="align-top">
                      <Td
                        className="py-3 whitespace-nowrap"
                        title={`${formatDate(entry.created_at)} ${formatTime(entry.created_at)}`}
                      >
                        <span className="text-muted-foreground">
                          {formatRelative(entry.created_at, now)}
                        </span>
                      </Td>
                      <Td className="py-3">
                        {entry.actor_id ? (
                          <PersonLabel person={team?.get(entry.actor_id)} size="xs" />
                        ) : (
                          <span className="text-muted-foreground">System</span>
                        )}
                      </Td>
                      <Td className="max-w-72 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded px-1.5 py-px text-[11px] font-semibold",
                              action.className,
                            )}
                          >
                            {action.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {table?.label ?? entry.table_name}
                          </span>
                        </div>
                        {table?.href && entry.action !== "delete" ? (
                          <Link
                            href={table.href(entry.record_id)}
                            className="mt-1 line-clamp-1 font-medium hover:underline"
                          >
                            {entry.record_label ?? "Untitled"}
                          </Link>
                        ) : (
                          <p className="mt-1 line-clamp-1 font-medium">
                            {entry.record_label ?? "Untitled"}
                          </p>
                        )}
                      </Td>
                      <Td className="py-3">
                        {lines.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <ul className="space-y-0.5 text-xs">
                            {lines.map((line) => (
                              <li key={line.field} className="flex flex-wrap items-center gap-1.5">
                                <span className="text-muted-foreground">{line.field}:</span>
                                {entry.action === "update" && (
                                  <>
                                    <span className="text-muted-foreground line-through">
                                      {line.from ?? "empty"}
                                    </span>
                                    <ArrowRight className="size-3 text-muted-foreground" />
                                  </>
                                )}
                                <span className="font-medium">{line.to ?? "empty"}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </TableShell>
          {data && (
            <Pagination page={params.page} total={data.total} onPage={(page) => update({ page })} />
          )}
        </div>
      )}
    </div>
  );
}
