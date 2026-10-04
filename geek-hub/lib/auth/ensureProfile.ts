import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { usernameFromEmail } from "./username";

const UNIQUE_VIOLATION = "23505";

// Створює рядок профілю, якщо його ще немає. Акаунт міг з'явитись в іншому
// проєкті спільного Supabase, тож викликаємо ліниво: після входу, у callback
// і в requireUser(). Конфлікт по user_id = профіль уже є — це успіх;
// конфлікт по username — пробуємо інший суфікс.
export async function ensureProfile(supabase: SupabaseClient, user: User): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase
      .from("geek_hub_profiles")
      .upsert(
        { user_id: user.id, username: usernameFromEmail(user.email) },
        { onConflict: "user_id", ignoreDuplicates: true },
      );

    if (!error) return;
    if (error.code !== UNIQUE_VIOLATION) throw new Error(error.message);
  }
  throw new Error("Could not generate a unique username");
}
