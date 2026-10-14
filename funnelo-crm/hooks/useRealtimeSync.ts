"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { type Entity, invalidateEntity } from "@/lib/query/invalidate";

const TABLES: Record<string, Entity> = {
  funnelo_deals: "deals",
  funnelo_activities: "activities",
};

// Скільки чекаємо, щоб злити пачку подій (масове перетягування, сідінг)
// в одну інвалідацію замість десятка перезапитів.
const DEBOUNCE_MS = 400;

/**
 * Зміни інших учасників (і з інших вкладок) приходять через Supabase Realtime.
 * Рядки з подій не кладемо в кеш напряму — у них немає вбудованих company/contact,
 * тож просто інвалідуємо відповідні гілки. Власні мутації теж повернуться
 * подією; структурне порівняння TanStack не перерендерить екран, якщо дані
 * не змінились.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    const pending = new Set<Entity>();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const flush = () => {
      pending.forEach((entity) => invalidateEntity(queryClient, entity));
      pending.clear();
    };

    const channel = supabase.channel("funnelo-sync");
    for (const [table, entity] of Object.entries(TABLES)) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        pending.add(entity);
        clearTimeout(timer);
        timer = setTimeout(flush, DEBOUNCE_MS);
      });
    }
    channel.subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
