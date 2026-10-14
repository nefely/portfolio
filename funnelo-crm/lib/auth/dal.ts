import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/crm";

// Data Access Layer (node_modules/next/dist/docs/01-app/02-guides/authentication.md):
// єдине місце, де сервер вирішує "хто це". proxy.ts робить лише оптимістичні
// редіректи. cache() — щоб за один рендер не ходити в Supabase двічі.

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Профіль поточного користувача у Funnelo. Акаунт міг з'явитись в іншому
 * проєкті спільного Supabase, тож профіль створюється ліниво — RPC
 * funnelo_ensure_profile повертає наявний або створює новий з роллю user.
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("funnelo_ensure_profile").single<Profile>();
  if (error) throw new Error(error.message);
  return data;
});

export async function requireProfile(nextPath: string) {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return profile;
}
