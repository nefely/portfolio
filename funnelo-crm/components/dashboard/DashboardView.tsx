"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, CalendarCheck } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import { AnimatedNumber, EASE_OUT } from "@/components/motion/AnimatedNumber";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityItem } from "@/components/activities/ActivityItem";
import { PageHeader } from "@/components/crm/PageHeader";
import { PersonAvatar } from "@/components/crm/PersonAvatar";
import { useMe } from "@/components/providers/MeProvider";
import { formatMoney, formatMoneyCompact } from "@/lib/format";
import { dashboardOptions, dueTodayOptions } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import { HorizontalBar, MonthlyWonChart, PipelineByStage } from "./Charts";

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
              index={0}
              label="Open pipeline"
              value={data.open_value}
              format={formatMoney}
              hint={`${data.open_count} open deals`}
            />
            <Kpi
              index={1}
              label="Weighted forecast"
              value={data.weighted_value}
              format={formatMoney}
              hint="Value × stage probability"
            />
            <Kpi
              index={2}
              label="Won this month"
              value={data.won_this_month}
              format={formatMoney}
              trend={trend(data.won_this_month, data.won_last_month)}
            />
            <Kpi
              index={3}
              label="Win rate · 90 days"
              value={data.win_rate_90d}
              format={formatPercent}
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
            <ListSkeleton rows={3} />
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
            <LeaderboardSkeleton />
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
                    <HorizontalBar
                      index={index}
                      percent={(rep.won_value / top) * 100}
                      className="ml-6 h-1.5"
                      fillClassName="bg-primary/70"
                    />
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

const formatPercent = (value: number) => `${Math.round(value * 10) / 10}%`;

function Kpi({
  index,
  label,
  value,
  format,
  hint,
  trend,
}: {
  index: number;
  label: string;
  value: number | null;
  format: (value: number) => string;
  hint?: string;
  trend?: number | null;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <m.div
      className="rounded-xl border bg-card px-4 py-3.5"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT, delay: index * 0.06 }}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">
        {value === null ? "—" : <AnimatedNumber value={value} format={format} />}
      </p>
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
    </m.div>
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

// Скелетони повторюють справжню розкладку (ті самі картки, панелі й висоти),
// тож коли приходять дані, нічого не зсувається — лише заглушки змінюються
// вмістом. Заголовки панелей статичні, тому показуються одразу.

/** Висоти стовпчиків-заглушок: "схожі на графік", а не однакові бруски. */
const SKELETON_BARS = [38, 52, 30, 64, 45, 72, 50, 58, 34, 80, 62, 46];

function DashboardSkeleton() {
  return (
    <div aria-busy aria-label="Loading dashboard" className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-xl border bg-card px-4 py-3.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-7 w-36" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel title="Won revenue" subtitle="Last 12 months">
          <div className="mt-5 flex h-52 items-end gap-1.5 pl-12">
            {SKELETON_BARS.map((height, index) => (
              <div key={index} className="flex h-full flex-1 items-end justify-center">
                <Skeleton
                  className="w-full max-w-9 rounded-b-none"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 ml-12 flex gap-1.5">
            {SKELETON_BARS.map((_, index) => (
              <div key={index} className="flex flex-1 justify-center">
                <Skeleton className="h-2.5 w-5" />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Pipeline by stage" subtitle="Open deals">
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 rounded-full" />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="ml-6 h-1.5 rounded-full" style={{ width: `${90 - index * 15}%` }} />
        </div>
      ))}
    </div>
  );
}

/** Рядки на кшталт ActivityItem: іконка-кружок, заголовок, мета-рядок. */
function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className="-my-3 divide-y">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex gap-3 py-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-4" style={{ width: `${70 - index * 12}%` }} />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
