"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { KanbanSquare } from "lucide-react";
import { EmptyState } from "@/components/crm/PageHeader";
import { PersonLabel } from "@/components/crm/PersonAvatar";
import { StageBadge } from "@/components/crm/StageBadge";
import {
  Pagination,
  SkeletonRows,
  SortableTh,
  TableShell,
  Td,
  Th,
} from "@/components/crm/DataTable";
import { useStageMap, useTeamMap } from "@/hooks/useTeam";
import { formatDate, formatMoney } from "@/lib/format";
import type { DealListParams } from "@/lib/query/keys";
import { dealListOptions } from "@/lib/query/options";

export function DealsTable({
  params,
  onChange,
}: {
  params: DealListParams;
  onChange: (patch: Partial<DealListParams>) => void;
}) {
  const team = useTeamMap();
  const stages = useStageMap();
  const { data, isPending, isPlaceholderData } = useQuery(dealListOptions(params));
  const sortProps = {
    sort: params.sort,
    dir: params.dir,
    onSort: (sort: string, dir: "asc" | "desc") => onChange({ sort, dir }),
  };

  if (data && data.total === 0) {
    return (
      <EmptyState
        icon={<KanbanSquare />}
        title="No deals match these filters"
        description="Try a different stage, owner or status."
      />
    );
  }

  return (
    <div className="space-y-3">
      <TableShell busy={isPlaceholderData}>
        <thead>
          <tr>
            <SortableTh label="Deal" column="title" {...sortProps} />
            <Th>Stage</Th>
            <SortableTh label="Value" column="value" className="text-right" {...sortProps} />
            <Th className="hidden md:table-cell">Company</Th>
            <Th className="hidden lg:table-cell">Owner</Th>
            <SortableTh
              label={params.status === "open" ? "Expected close" : "Closed"}
              column={params.status === "open" ? "expected_close_date" : "closed_at"}
              className="hidden sm:table-cell"
              {...sortProps}
            />
          </tr>
        </thead>
        <tbody>
          {isPending ? (
            <SkeletonRows columns={6} />
          ) : (
            data?.rows.map((deal) => (
              <tr key={deal.id} className="transition-colors hover:bg-muted/40">
                <Td className="max-w-72">
                  <Link
                    href={`/deals/${deal.id}`}
                    className="line-clamp-1 font-medium hover:underline"
                  >
                    {deal.title}
                  </Link>
                  {deal.lost_reason && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">{deal.lost_reason}</p>
                  )}
                </Td>
                <Td>
                  <StageBadge stage={stages?.get(deal.stage_id)} />
                </Td>
                <Td className="text-right font-medium tabular-nums">{formatMoney(deal.value)}</Td>
                <Td className="hidden max-w-48 md:table-cell">
                  {deal.company ? (
                    <Link
                      href={`/companies/${deal.company.id}`}
                      className="line-clamp-1 hover:underline"
                    >
                      {deal.company.name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </Td>
                <Td className="hidden lg:table-cell">
                  <PersonLabel person={deal.owner_id ? team?.get(deal.owner_id) : null} size="xs" />
                </Td>
                <Td className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                  {formatDate(
                    params.status === "open"
                      ? deal.expected_close_date
                      : (deal.closed_at ?? deal.expected_close_date),
                  )}
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableShell>
      {data && (
        <Pagination page={params.page} total={data.total} onPage={(page) => onChange({ page })} />
      )}
    </div>
  );
}
