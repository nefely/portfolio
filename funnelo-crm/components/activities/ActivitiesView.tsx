"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, PageHeader } from "@/components/crm/PageHeader";
import { SimpleSelect } from "@/components/crm/SimpleSelect";
import { useMe } from "@/components/providers/MeProvider";
import { useListParams } from "@/hooks/useListParams";
import { useTeam } from "@/hooks/useTeam";
import { type DueGroup, groupByDue } from "@/lib/activities";
import { activityListOptions } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import type { ActivityRow } from "@/types/crm";
import { ActivityFormDialog } from "./ActivityFormDialog";
import { ActivityItem } from "./ActivityItem";

const GROUPS: { key: DueGroup; title: string; tone?: string }[] = [
  { key: "overdue", title: "Overdue", tone: "text-destructive" },
  { key: "today", title: "Today", tone: "text-primary" },
  { key: "upcoming", title: "Upcoming" },
  { key: "someday", title: "No due date" },
];

// owner: "" — уся команда; за замовчуванням — свої задачі ("me").
const DEFAULTS = { scope: "open", owner: "me" };

export function ActivitiesView() {
  const me = useMe();
  const { data: team = [] } = useTeam();
  const [params, update] = useListParams(DEFAULTS);
  const [creating, setCreating] = useState(false);
  const [now] = useState(() => Date.now());

  const scope = params.scope === "completed" ? "completed" : "open";
  const ownerId = params.owner === "me" ? me.user_id : params.owner;
  const { data, isPending } = useQuery(activityListOptions({ ownerId, scope }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Activities"
        description="Calls, meetings and tasks: what needs to happen next."
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus /> New activity
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={scope} onValueChange={(value) => update({ scope: String(value) })}>
          <TabsList>
            <TabsTrigger value="open">To do</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        <SimpleSelect
          value={params.owner}
          onChange={(owner) => update({ owner })}
          options={[
            { value: "me", label: "My activities" },
            { value: "", label: "Whole team" },
            ...team
              .filter((m) => m.is_active && m.user_id !== me.user_id)
              .map((m) => ({ value: m.user_id, label: m.full_name })),
          ]}
          placeholder="Owner"
          className="min-w-0 flex-1 sm:w-44 sm:flex-none"
        />
      </div>

      {isPending ? (
        // Та сама форма, що й група з ActivityItem: шапка + рядки з іконкою.
        <section aria-busy aria-label="Loading activities" className="rounded-xl border bg-card">
          <div className="flex items-center gap-2 border-b px-4 py-2.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-4" />
          </div>
          <div className="divide-y px-4">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="flex gap-3 py-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-4" style={{ width: `${62 - (index % 3) * 12}%` }} />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : data?.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck />}
          title={scope === "open" ? "You're all caught up" : "Nothing completed yet"}
          description={scope === "open" ? "No open calls, meetings or tasks." : undefined}
        />
      ) : scope === "completed" ? (
        <Group title="Recently completed" activities={data ?? []} now={now} />
      ) : (
        <div className="space-y-4">
          {(() => {
            const groups = groupByDue(data ?? [], now);
            return GROUPS.filter(({ key }) => groups[key].length > 0).map(
              ({ key, title, tone }) => (
                <Group key={key} title={title} tone={tone} activities={groups[key]} now={now} />
              ),
            );
          })()}
        </div>
      )}

      <ActivityFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}

function Group({
  title,
  tone,
  activities,
  now,
}: {
  title: string;
  tone?: string;
  activities: ActivityRow[];
  now: number;
}) {
  return (
    <section className="rounded-xl border bg-card">
      <header className="flex items-center gap-2 border-b px-4 py-2.5">
        <h2 className={cn("text-sm font-semibold", tone)}>{title}</h2>
        <span className="text-xs text-muted-foreground tabular-nums">{activities.length}</span>
      </header>
      <div className="divide-y px-4">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} now={now} showContext />
        ))}
      </div>
    </section>
  );
}
