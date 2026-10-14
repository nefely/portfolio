"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

// Вихід або вхід під іншим акаунтом (у тому числі в іншій вкладці): кеш
// попереднього користувача прибираємо повністю — права в CRM залежать від
// ролі, тож чужі закешовані дані показувати не можна.
export function AuthListener() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    let currentUserId: string | null | undefined;
    const {
      data: { subscription },
    } = createClient().auth.onAuthStateChange((event, session) => {
      const nextUserId = session?.user.id ?? null;
      if (event === "INITIAL_SESSION" || currentUserId === undefined) {
        currentUserId = nextUserId;
        return;
      }
      if (nextUserId === currentUserId) return;

      currentUserId = nextUserId;
      queryClient.clear();
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [queryClient, router]);

  return null;
}
