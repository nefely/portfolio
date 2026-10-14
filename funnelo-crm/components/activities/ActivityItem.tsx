"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PersonAvatar } from "@/components/crm/PersonAvatar";
import { useMe } from "@/components/providers/MeProvider";
import { useTeamMap } from "@/hooks/useTeam";
import { deleteActivity, setActivityCompleted } from "@/lib/data/activities";
import { formatDate, formatRelative, formatTime } from "@/lib/format";
import { canEdit } from "@/lib/permissions";
import { invalidateEntity } from "@/lib/query/invalidate";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ActivityRow } from "@/types/crm";
import { ACTIVITY_META } from "./activityMeta";

/**
 * Рядок активності. Позначка "виконано" — оптимістична в усіх списках
 * активностей одразу (setQueriesData по гілці ["activities"]).
 */
export function ActivityItem({
  activity,
  now,
  showContext = false,
}: {
  activity: ActivityRow;
  /** Мітка часу рендера списку — для "overdue" і відносних дат. */
  now: number;
  /** Показувати угоду/компанію (на сторінці Activities), а не лише текст. */
  showContext?: boolean;
}) {
  const me = useMe();
  const team = useTeamMap();
  const queryClient = useQueryClient();
  const meta = ACTIVITY_META[activity.type];
  const Icon = meta.icon;
  const editable = canEdit(me, activity.owner_id);
  const done = activity.completed_at !== null;
  const overdue = !done && activity.due_at !== null && new Date(activity.due_at).getTime() < now;
  const isNote = activity.type === "note";

  const toggle = useMutation({
    mutationFn: (completed: boolean) =>
      setActivityCompleted(createClient(), activity.id, completed),
    onMutate: async (completed) => {
      await queryClient.cancelQueries({ queryKey: ["activities"] });
      const snapshot = queryClient.getQueriesData<ActivityRow[]>({ queryKey: ["activities"] });
      queryClient.setQueriesData<ActivityRow[]>({ queryKey: ["activities"] }, (rows) =>
        rows?.map((row) =>
          row.id === activity.id
            ? { ...row, completed_at: completed ? new Date().toISOString() : null }
            : row,
        ),
      );
      return { snapshot };
    },
    onError: (error, _completed, context) => {
      context?.snapshot.forEach(([key, rows]) => queryClient.setQueryData(key, rows));
      toast.error(error.message);
    },
    onSettled: () => invalidateEntity(queryClient, "activities"),
  });

  const remove = useMutation({
    mutationFn: () => deleteActivity(createClient(), activity.id),
    onSuccess: () => {
      invalidateEntity(queryClient, "activities");
      toast.success("Activity deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  const when = activity.due_at ?? activity.created_at;

  return (
    <div className="group/activity flex gap-3 py-3">
      <span
        className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", meta.tone)}
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start gap-2">
          {!isNote && (
            <Checkbox
              checked={done}
              disabled={!editable || toggle.isPending}
              onCheckedChange={(checked) => toggle.mutate(checked === true)}
              aria-label={done ? "Mark as not done" : "Mark as done"}
              className="mt-0.5"
            />
          )}
          <p
            className={cn(
              "min-w-0 flex-1 text-sm font-medium",
              done && "text-muted-foreground line-through",
            )}
          >
            {activity.subject}
          </p>
          {editable && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="opacity-0 group-hover/activity:opacity-100 focus-visible:opacity-100"
              onClick={() => remove.mutate()}
              disabled={remove.isPending}
              aria-label="Delete activity"
            >
              <Trash2 />
            </Button>
          )}
        </div>

        {activity.body && (
          <p className="text-sm whitespace-pre-line text-muted-foreground">{activity.body}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <PersonAvatar
              person={activity.owner_id ? team?.get(activity.owner_id) : null}
              size="xs"
            />
            {meta.label}
          </span>
          <span
            className={cn(overdue && "font-medium text-destructive")}
            title={`${formatDate(when)} ${formatTime(when)}`}
          >
            {isNote
              ? formatRelative(activity.created_at, now)
              : done
                ? `Done ${formatRelative(activity.completed_at as string, now)}`
                : `${overdue ? "Overdue · " : "Due "}${formatRelative(when, now)}`}
          </span>
          {showContext && activity.deal && (
            <Link
              href={`/deals/${activity.deal.id}`}
              className="truncate hover:text-foreground hover:underline"
            >
              {activity.deal.title}
            </Link>
          )}
          {showContext && !activity.deal && activity.company && (
            <Link
              href={`/companies/${activity.company.id}`}
              className="truncate hover:text-foreground hover:underline"
            >
              {activity.company.name}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
