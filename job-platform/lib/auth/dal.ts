import "server-only";

import { cache } from "react";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AccountRole } from "@/types/account";
import { isAccountRole } from "./roles";

// Data Access Layer (див. node_modules/next/dist/docs/01-app/02-guides/authentication.md):
// єдине місце, де сервер вирішує "хто це і що йому можна". proxy.ts робить
// лише оптимістичні редіректи; кожна сторінка/дія кабінету викликає ці
// функції сама. cache() — щоб за один рендер не ходити в Supabase двічі.

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getAccountRole = cache(async (userId: string): Promise<AccountRole | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_platform_profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return isAccountRole(data?.role) ? data.role : null;
});

export async function requireUser(nextPath: string) {
  const user = await getCurrentUser();
  if (!user) {
    const locale = await getLocale();
    redirect({ href: { pathname: "/login", query: { next: `/${locale}${nextPath}` } }, locale });
  }
  return user!;
}

// Для сторінок кабінету, яким потрібна вже обрана роль. Акаунт без рядка в
// job_platform_profiles (напр. створений у task-manager на спільному
// Supabase) веде на вибір ролі.
export async function requireProfile(nextPath: string) {
  const user = await requireUser(nextPath);
  const role = await getAccountRole(user.id);

  if (!role) {
    const locale = await getLocale();
    redirect({ href: "/account/role", locale });
  }

  return { user, role: role! };
}
