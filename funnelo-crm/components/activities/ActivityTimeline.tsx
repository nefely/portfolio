"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { activitiesForOptions } from "@/lib/query/options";
import type { ActivityType } from "@/types/crm";
import { type ActivityLink, ActivityFormDialog } from "./ActivityFormDialog";
import { ActivityItem } from "./ActivityItem";

/**
 * Таймлайн на сторінці угоди / компанії / контакту: спершу відкриті дії
 * (що робити далі), нижче — історія.
 */
export function ActivityTimeline({
  kind,
  id,
  link,
}: {
  kind: "deal" | "company" | "contact";
  id: string;
  link: ActivityLink;
}) {
  const { data: activities, isPending } = useQuery(activitiesForOptions(kind, id));
  const [composer, setComposer] = useState<ActivityType | null>(null);
  // Час фіксуємо при завантаженні даних — відносні дати не "пливуть" між рендерами.
  const [now] = useState(() => Date.now());

  const upcoming = (activities ?? [])
    .filter((item) => item.type !== "note" && item.completed_at === null)
    .sort((a, b) => (a.due_at ?? "").localeCompare(b.due_at ?? ""));
  const history = (activities ?? []).filter(
    (item) => item.type === "note" || item.completed_at !== null,
  );

  return (
    <section className="rounded-xl border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <h2 className="font-semibold">Activity</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setComposer("note")}>
            <StickyNote /> Note
          </Button>
          <Button size="sm" onClick={() => setComposer("task")}>
            <CalendarPlus /> Schedule
          </Button>
        </div>
      </header>

      <div className="px-4">
        {isPending ? (
          <div className="space-y-4 py-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : activities?.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nothing logged yet. Schedule the next step or add a note.
          </p>
        ) : (
          <>
            {upcoming.length > 0 && (
              <TimelineGroup title="Next steps">
                {upcoming.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} now={now} />
                ))}
              </TimelineGroup>
            )}
            {history.length > 0 && (
              <TimelineGroup title="History">
                {history.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} now={now} />
                ))}
              </TimelineGroup>
            )}
          </>
        )}
      </div>

      <ActivityFormDialog
        open={composer !== null}
        onOpenChange={(open) => !open && setComposer(null)}
        link={link}
        defaultType={composer ?? "task"}
      />
    </section>
  );
}

function TimelineGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <h3 className="pt-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="divide-y">{children}</div>
    </div>
  );
}
