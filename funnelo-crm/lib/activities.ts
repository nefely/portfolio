import type { ActivityRow } from "@/types/crm";

export type DueGroup = "overdue" | "today" | "upcoming" | "someday";

/** Відкриті активності → групи за дедлайном відносно локального "сьогодні". */
export function groupByDue(activities: ActivityRow[], now: number) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const groups: Record<DueGroup, ActivityRow[]> = {
    overdue: [],
    today: [],
    upcoming: [],
    someday: [],
  };
  for (const activity of activities) {
    if (!activity.due_at) {
      groups.someday.push(activity);
      continue;
    }
    const due = new Date(activity.due_at).getTime();
    // Сьогоднішні задачі лишаються в "Today", навіть якщо година вже минула.
    if (due < startOfToday.getTime()) groups.overdue.push(activity);
    else if (due < endOfToday.getTime()) groups.today.push(activity);
    else groups.upcoming.push(activity);
  }
  return groups;
}
