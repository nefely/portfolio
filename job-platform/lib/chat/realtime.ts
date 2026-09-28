import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/types/chat";
import { mapMessageRow, type MessageRow } from "./mapMessageRow";

interface SubscribeOptions {
  // Без conversationId — усі повідомлення, які RLS дозволяє бачити
  // (тобто з усіх розмов поточного користувача).
  conversationId?: string;
  onInsert: (message: ChatMessage) => void;
  // Кожне (пере)підключення WebSocket — щоб дотягнути пропущене.
  onSubscribed?: () => void;
}

// Підписка на нові рядки job_platform_messages через Supabase Realtime.
// Повертає функцію відписки для cleanup у useEffect.
export function subscribeToMessages({ conversationId, onInsert, onSubscribed }: SubscribeOptions) {
  const supabase = createClient();
  let channel: RealtimeChannel | null = null;
  let cancelled = false;

  // Realtime перевіряє RLS від імені JWT сокета — передаємо токен сесії явно,
  // не чекаючи, поки клієнт сам підхопить його з onAuthStateChange.
  supabase.auth.getSession().then(async ({ data }) => {
    if (cancelled) return;
    await supabase.realtime.setAuth(data.session?.access_token ?? null);
    if (cancelled) return;

    channel = supabase
      .channel(`job_platform_messages:${conversationId ?? "inbox"}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "job_platform_messages",
          ...(conversationId ? { filter: `conversation_id=eq.${conversationId}` } : {}),
        },
        (payload) => onInsert(mapMessageRow(payload.new as MessageRow)),
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") onSubscribed?.();
      });
  });

  return () => {
    cancelled = true;
    if (channel) void supabase.removeChannel(channel);
  };
}
