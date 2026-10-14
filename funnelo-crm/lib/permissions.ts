import type { Profile } from "@/types/crm";

// Дзеркало RLS-політик (supabase/schema.sql) для UI: ховаємо кнопки, які
// сервер однаково відхилив би. Справжній захист — лише в БД.

export function isAdmin(me: Pick<Profile, "role">) {
  return me.role === "admin";
}

/** Учасник бачить усе, а редагує лише свої записи; admin — будь-які. */
export function canEdit(me: Pick<Profile, "role" | "user_id">, ownerId: string | null) {
  return isAdmin(me) || (ownerId !== null && ownerId === me.user_id);
}
