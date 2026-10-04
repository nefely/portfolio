import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "./ensureProfile";

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

export async function requireUser(nextPath: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  // Захищені сторінки — бібліотека/списки/налаштування — потребують профілю
  // (FK у geek_hub_lists, username у налаштуваннях).
  await ensureCurrentProfile();
  return user;
}

const ensureCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (user) await ensureProfile(await createClient(), user);
});
