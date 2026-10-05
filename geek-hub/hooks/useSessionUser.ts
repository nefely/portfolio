"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query/keys";
import { useHydrated } from "./useHydrated";

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
//
// На сервері сесія невідома (pending), а в браузері вона часто вже лежить у
// кеші (AuthListener, попередня сторінка). Щоб HTML гідратації збігався з
// серверним, до кінця гідратації завжди віддаємо "ще вантажиться" і лише
// потім — реальне значення.
export function useSessionUser() {
  const hydrated = useHydrated();
  const { data, isPending } = useQuery({
    queryKey: queryKeys.sessionUser,
    queryFn: readSessionUser,
    staleTime: Infinity,
  });
  if (!hydrated) return { user: null, isPending: true };
  return { user: data ?? null, isPending };
}
