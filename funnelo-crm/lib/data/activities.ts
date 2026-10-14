import type { ActivityListParams } from "@/lib/query/keys";
import type { ActivityRow, ActivityType } from "@/types/crm";
import { type Db, nullIfEmpty, unwrap } from "./shared";

export const ACTIVITY_SELECT =
  "*, deal:funnelo_deals(id, title), contact:funnelo_contacts(id, full_name), company:funnelo_companies(id, name)";

/**
 * Сторінка "Activities": відкриті — усі (їх мало, групуються на клієнті у
 * overdue / today / upcoming), виконані — останні 100.
 */
export async function fetchActivityList(db: Db, params: ActivityListParams) {
  let query = db.from("funnelo_activities").select(ACTIVITY_SELECT);
  if (params.ownerId) query = query.eq("owner_id", params.ownerId);

  query =
    params.scope === "open"
      ? query
          .is("completed_at", null)
          .neq("type", "note")
          .order("due_at", { ascending: true, nullsFirst: false })
      : query
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false })
          .limit(100);

  return unwrap<ActivityRow[]>(await query);
}

/** Таймлайн на сторінці угоди / компанії / контакту. */
export async function fetchActivitiesFor(db: Db, kind: "deal" | "company" | "contact", id: string) {
  return unwrap<ActivityRow[]>(
    await db
      .from("funnelo_activities")
      .select(ACTIVITY_SELECT)
      .eq(`${kind}_id`, id)
      .order("created_at", { ascending: false })
      .limit(200),
  );
}

/** Відкриті задачі власника з дедлайном до кінця сьогодні (включно з простроченими). */
export async function fetchDueToday(db: Db, ownerId: string) {
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  return unwrap<ActivityRow[]>(
    await db
      .from("funnelo_activities")
      .select(ACTIVITY_SELECT)
      .eq("owner_id", ownerId)
      .is("completed_at", null)
      .neq("type", "note")
      .lte("due_at", endOfDay.toISOString())
      .order("due_at"),
  );
}

export type ActivityInput = {
  type: ActivityType;
  subject: string;
  body: string | null;
  due_at: string | null;
  deal_id: string | null;
  contact_id: string | null;
  company_id: string | null;
};

export async function createActivity(db: Db, input: ActivityInput) {
  return unwrap<ActivityRow>(
    await db.from("funnelo_activities").insert(nullIfEmpty(input)).select(ACTIVITY_SELECT).single(),
  );
}

export async function setActivityCompleted(db: Db, id: string, completed: boolean) {
  return unwrap<ActivityRow>(
    await db
      .from("funnelo_activities")
      .update({ completed_at: completed ? new Date().toISOString() : null })
      .eq("id", id)
      .select(ACTIVITY_SELECT)
      .single(),
  );
}

export async function deleteActivity(db: Db, id: string) {
  unwrap(await db.from("funnelo_activities").delete().eq("id", id));
}
