import type { Profile, Role } from "@/types/crm";
import { type Db, unwrap } from "./shared";

const PROFILE_COLUMNS =
  "user_id, email, full_name, title, role, avatar_color, is_active, created_at";

export async function fetchTeam(db: Db) {
  return unwrap<Profile[]>(
    await db.from("funnelo_profiles").select(PROFILE_COLUMNS).order("full_name"),
  );
}

export async function updateMyProfile(
  db: Db,
  userId: string,
  patch: Pick<Profile, "full_name" | "title" | "avatar_color">,
) {
  return unwrap<Profile>(
    await db
      .from("funnelo_profiles")
      .update(patch)
      .eq("user_id", userId)
      .select(PROFILE_COLUMNS)
      .single(),
  );
}

/** Лише admin; БД додатково забороняє міняти роль/доступ самому собі. */
export async function updateMemberAccess(
  db: Db,
  userId: string,
  patch: Partial<{ role: Role; is_active: boolean }>,
) {
  return unwrap<Profile>(
    await db
      .from("funnelo_profiles")
      .update(patch)
      .eq("user_id", userId)
      .select(PROFILE_COLUMNS)
      .single(),
  );
}
