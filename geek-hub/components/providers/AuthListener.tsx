"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query/keys";
import type { SessionUser } from "@/hooks/useSessionUser";

// Тримає кеш сесії синхронним із Supabase Auth (вхід/вихід, у тому числі в
// іншій вкладці) і чистить дані попереднього користувача.
export function AuthListener() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = createClient().auth.onAuthStateChange((event, session) => {
      const next: SessionUser | null = session?.user
        ? { id: session.user.id, email: session.user.email ?? null }
        : null;
      const previous = queryClient.getQueryData<SessionUser | null>(queryKeys.sessionUser);
      queryClient.setQueryData(queryKeys.sessionUser, next);

      if (event === "INITIAL_SESSION" || previous === undefined || previous?.id === next?.id)
        return;

      if (previous) queryClient.removeQueries({ queryKey: ["user", previous.id] });
      // Серверні компоненти (бібліотека, списки) рендерились під старою сесією.
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [queryClient, router]);

  return null;
}
