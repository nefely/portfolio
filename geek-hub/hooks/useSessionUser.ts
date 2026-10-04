"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query/keys";

export interface SessionUser {
  id: string;
  email: string | null;
}

async function readSessionUser(): Promise<SessionUser | null> {
  // getSession() читає cookies локально, без мережі — для UI цього досить.
  // Доступ до даних однаково перевіряє RLS на боці Supabase.
  const { data } = await createClient().auth.getSession();
  const user = data.session?.user;
  return user ? { id: user.id, email: user.email ?? null } : null;
}

// Сесію читаємо на клієнті, а не в root layout: так layout не стає
// динамічним через cookies(), і публічні сторінки (головна, тайтли)
// лишаються статичними/ISR. Тримаємо в кеші лише {id, email}: оновлення
// токена дає новий об'єкт User, але structural sharing TanStack повертає
// той самий SessionUser — споживачі не перерендерюються.
export function useSessionUser() {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.sessionUser,
    queryFn: readSessionUser,
    staleTime: Infinity,
  });
  return { user: data ?? null, isPending };
}
