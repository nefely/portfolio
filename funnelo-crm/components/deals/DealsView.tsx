"use client";

import { KanbanSquare, Rows3 } from "lucide-react";
import { ExportButton } from "@/components/crm/ExportButton";
import { PageHeader } from "@/components/crm/PageHeader";
import { SearchInput } from "@/components/crm/DataTable";
import { SimpleSelect } from "@/components/crm/SimpleSelect";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMe } from "@/components/providers/MeProvider";
import { useListParams } from "@/hooks/useListParams";
import { useStageMap, useStages, useTeam, useTeamMap } from "@/hooks/useTeam";
import { fetchDealList } from "@/lib/data/deals";
import { EXPORT_RANGE } from "@/lib/data/shared";
import type { DealListParams } from "@/lib/query/keys";
import { createClient } from "@/lib/supabase/client";
import { DealBoard } from "./DealBoard";
import { DealsTable } from "./DealsTable";

const DEFAULTS = {
  view: "board",
  search: "",
  ownerId: "",
  page: 0,
  sort: "created_at",
  dir: "desc",
  stageId: "",
  status: "open",
};

export function DealsView() {
  const me = useMe();
  const { data: team = [] } = useTeam();
  const { data: stages = [] } = useStages();
  const teamMap = useTeamMap();
  const stageMap = useStageMap();
  const [params, update] = useListParams(DEFAULTS);
  const isBoard = params.view !== "table";

  const listParams = {
    page: params.page,
    sort: params.sort,
    dir: params.dir === "asc" ? "asc" : "desc",
    search: params.search,
    stageId: params.stageId,
    ownerId: params.ownerId,
    status: (["all", "open", "won", "lost"].includes(params.status)
      ? params.status
      : "open") as DealListParams["status"],
  } satisfies DealListParams;

  const ownerOptions = [
    { value: "", label: "All owners" },
    { value: me.user_id, label: "My deals" },
    ...team
      .filter((member) => member.user_id !== me.user_id)
      .map((m) => ({ value: m.user_id, label: m.full_name })),
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Deals"
        description={
          isBoard
            ? "Drag cards between stages. Drop on Won or Lost to close a deal."
            : "Every deal, open and closed."
        }
        actions={
          <Tabs
            value={isBoard ? "board" : "table"}
            onValueChange={(view) => update({ view: String(view) })}
          >
            <TabsList>
              <TabsTrigger value="board">
                <KanbanSquare /> Board
              </TabsTrigger>
              <TabsTrigger value="table">
                <Rows3 /> Table
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={params.search}
          onChange={(search) => update({ search })}
          placeholder={isBoard ? "Search deals or companies" : "Search deals"}
        />
        <SimpleSelect
          value={params.ownerId}
          onChange={(ownerId) => update({ ownerId })}
          options={ownerOptions}
          placeholder="All owners"
          className="w-40"
          size="sm"
        />
        {!isBoard && (
          <>
            <SimpleSelect
              value={listParams.status}
              onChange={(status) => update({ status: status || "open" })}
              options={[
                { value: "open", label: "Open" },
                { value: "won", label: "Won" },
                { value: "lost", label: "Lost" },
                { value: "all", label: "All statuses" },
              ]}
              placeholder="Status"
              className="w-32"
              size="sm"
            />
            <SimpleSelect
              value={params.stageId}
              onChange={(stageId) => update({ stageId })}
              options={[
                { value: "", label: "All stages" },
                ...stages.map((s) => ({ value: s.id, label: s.name })),
              ]}
              placeholder="All stages"
              className="w-36"
              size="sm"
            />
            <div className="ml-auto">
              <ExportButton
                filename="deals"
                fetchRows={async () =>
                  (await fetchDealList(createClient(), listParams, EXPORT_RANGE)).rows
                }
                columns={[
                  { header: "Title", value: (d) => d.title },
                  { header: "Value (USD)", value: (d) => d.value },
                  { header: "Stage", value: (d) => stageMap?.get(d.stage_id)?.name },
                  { header: "Company", value: (d) => d.company?.name },
                  { header: "Contact", value: (d) => d.contact?.full_name },
                  {
                    header: "Owner",
                    value: (d) => (d.owner_id ? teamMap?.get(d.owner_id)?.full_name : ""),
                  },
                  { header: "Expected close", value: (d) => d.expected_close_date },
                  { header: "Closed at", value: (d) => d.closed_at },
                  { header: "Lost reason", value: (d) => d.lost_reason },
                  { header: "Created at", value: (d) => d.created_at },
                ]}
              />
            </div>
          </>
        )}
      </div>

      {isBoard ? (
        <DealBoard filters={{ search: params.search, ownerId: params.ownerId }} />
      ) : (
        <DealsTable params={listParams} onChange={update} />
      )}
    </div>
  );
}
