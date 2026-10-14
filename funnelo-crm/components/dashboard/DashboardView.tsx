"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, CalendarCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityItem } from "@/components/activities/ActivityItem";
import { PageHeader } from "@/components/crm/PageHeader";
import { PersonAvatar } from "@/components/crm/PersonAvatar";
import { useMe } from "@/components/providers/MeProvider";
import { formatMoney, formatMoneyCompact } from "@/lib/format";
import { dashboardOptions, dueTodayOptions } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import { MonthlyWonChart, PipelineByStage } from "./Charts";

export function DashboardView() {
  const me = useMe();
  const [scope, setScope] = useState<"team" | "me">("team");
  const { data, isPending } = useQuery(dashboardOptions(scope === "me" ? me.user_id : null));
  const { data: due = [], isPending: duePending } = useQuery(dueTodayOptions(me.user_id));
  const [now] = useState(() => Date.now());
  const firstName = me.full_name.split(" ")[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hi, ${firstName}`}
        description="Here's how the pipeline looks today."
        actions={
          <Tabs value={scope} onValueChange={(value) => setScope(value as "team" | "me")}>
            <TabsList>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="me">My numbers</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {isPending || !data ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              label="Open pipeline"
              value={formatMoney(data.open_value)}
              hint={`${data.open_count} open deals`}
            />
            <Kpi
              label="Weighted forecast"
              value={formatMoney(data.weighted_value)}
              hint="Value × stage probability"
            />
            <Kpi
              label="Won this month"
              value={formatMoney(data.won_this_month)}
              trend={trend(data.won_this_month, data.won_last_month)}
            />
            <Kpi
              label="Win rate · 90 days"
              value={data.win_rate_90d === null ? "—" : `${data.win_rate_90d}%`}
              hint={
                data.avg_won_value_90d === null
                  ? "No closed deals yet"
                  : `Avg deal ${formatMoneyCompact(data.avg_won_value_90d)} · ${data.avg_cycle_days_90d ?? "—"} days to close`
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <Panel title="Won revenue" subtitle="Last 12 months">
              <MonthlyWonChart months={data.monthly} />
            </Panel>
            <Panel
              title="Pipeline by stage"
              subtitle="Open deals"
              action={
                <Link href="/deals" className="text-xs text-primary hover:underline">
                  Open board
                </Link>
              }
            >
              <PipelineByStage stages={data.by_stage} />
            </Panel>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel
          title="Due today"
          subtitle="Your open calls, meetings and tasks, including overdue ones"
          action={
            <Link href="/activities" className="text-xs text-primary hover:underline">
              All activities
            </Link>
          }
        >
          {duePending ? (
            <Skeleton className="h-24" />
          ) : due.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
              <CalendarCheck className="size-6" />
              Nothing due. Nice.
            </div>
          ) : (
            <div className="-my-3 divide-y">
              {due.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} now={now} showContext />
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Leaderboard" subtitle="Won in the last 90 days">
          {!data ? (
            <Skeleton className="h-40" />
          ) : (
            <ol className="space-y-3">
              {data.leaderboard.map((rep, index) => {
                const top = data.leaderboard[0]?.won_value || 1;
                return (
                  <li key={rep.user_id} className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-4 text-xs text-muted-foreground tabular-nums">
                        {index + 1}
                      </span>
                      <PersonAvatar person={rep} size="xs" />
                      <span
                        className={cn(
                          "flex-1 truncate",
                          rep.user_id === me.user_id && "font-semibold",
                        )}
                      >
                        {rep.full_name}
                      </span>
                      <span className="font-medium tabular-nums">
                        {formatMoneyCompact(rep.won_value)}
                      </span>
                    </div>
                    <div className="ml-6 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${(rep.won_value / top) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
      </div>
    </div>
  );
}

function trend(current: number, previous: number) {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function Kpi({
  label,
  value,
  hint,
  trend,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: number | null;
}) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {trend !== undefined && trend !== null ? (
        <p
          className={cn(
            "mt-0.5 flex items-center gap-1 text-xs",
            trend >= 0 ? "text-success" : "text-destructive",
          )}
        >
          {trend >= 0 ? (
            <ArrowUpRight className="size-3.5" />
          ) : (
            <ArrowDownRight className="size-3.5" />
          )}
          {Math.abs(trend)}% vs last month
        </p>
      ) : (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint ?? "No data for last month"}</p>
      )}
    </div>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card">
      <header className="flex items-start justify-between gap-2 px-4 pt-4 pb-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="px-4 pb-4">{children}</div>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </>
  );
}
