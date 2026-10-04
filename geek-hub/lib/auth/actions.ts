"use server";

import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "./ensureProfile";

// Викликається з клієнта одразу після входу паролем: сесію вже записав
// браузерний клієнт у cookies, тож сервер бачить користувача.
export async function ensureMyProfile(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await ensureProfile(supabase, user);
}
