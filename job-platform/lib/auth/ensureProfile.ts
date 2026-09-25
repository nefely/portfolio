import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccountRole } from "@/types/account";

const UNIQUE_VIOLATION = "23505";

// Створює рядок ролі, якщо його ще немає. Повторний виклик (подвійний клік,
// повторне відкриття посилання з листа) не міняє вже обрану роль — user_id є
// первинним ключем, а update-політики немає (див. supabase/schema.sql).
export async function ensureProfile(
  supabase: SupabaseClient,
  userId: string,
  role: AccountRole,
): Promise<void> {
  const { error } = await supabase.from("job_platform_profiles").insert({ user_id: userId, role });

  if (error && error.code !== UNIQUE_VIOLATION) {
    throw new Error(error.message);
  }
}
