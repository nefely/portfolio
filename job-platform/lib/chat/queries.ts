import "server-only";

import { isUuid } from "@/lib/isUuid";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, ChatParticipant, ConversationSummary } from "@/types/chat";
import { MESSAGE_COLUMNS, mapMessageRow } from "./mapMessageRow";

// Скільки останніх повідомлень показувати при відкритті розмови — далі
// нові приходять через Realtime.
const THREAD_HISTORY_LIMIT = 200;

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Імена співрозмовників з публічних профілів. RLS кандидатів віддає лише
// is_public-профілі — прихований профіль лишиться без імені (name: null).
async function resolveParticipants(
  supabase: Supabase,
  userIds: string[],
): Promise<Map<string, ChatParticipant>> {
  const result = new Map<string, ChatParticipant>(
    userIds.map((userId) => [userId, { userId, name: null, kind: null }]),
  );
  if (userIds.length === 0) return result;

  const [candidates, employers] = await Promise.all([
    supabase.from("job_platform_candidates").select("user_id, name, slug").in("user_id", userIds),
    supabase.from("job_platform_employers").select("user_id, name").in("user_id", userIds),
  ]);

  if (candidates.error) throw new Error(candidates.error.message);
  if (employers.error) throw new Error(employers.error.message);

  for (const row of candidates.data) {
    result.set(row.user_id, {
      userId: row.user_id,
      name: row.name,
      kind: "candidate",
      profileSlug: row.slug,
    });
  }
  for (const row of employers.data) {
    result.set(row.user_id, { userId: row.user_id, name: row.name, kind: "employer" });
  }

  return result;
}

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("job_platform_my_conversations");
  if (error) throw new Error(error.message);

  const rows = data as {
    id: string;
    other_user_id: string;
    last_message_at: string;
    last_message_body: string | null;
    last_message_sender_id: string | null;
    unread_count: number;
  }[];

  const participants = await resolveParticipants(supabase, [
    ...new Set(rows.map((row) => row.other_user_id)),
  ]);

  return rows.map((row) => ({
    id: row.id,
    other: participants.get(row.other_user_id)!,
    lastMessageAt: row.last_message_at,
    lastMessageBody: row.last_message_body,
    lastMessageFromMe: row.last_message_sender_id === userId,
    unreadCount: row.unread_count,
  }));
}

export interface ConversationThread {
  id: string;
  other: ChatParticipant;
  messages: ChatMessage[];
}

// null → 404: розмови немає або користувач не її учасник (RLS не віддасть
// чужу розмову).
export async function getConversation(
  conversationId: string,
  userId: string,
): Promise<ConversationThread | null> {
  if (!isUuid(conversationId)) return null;

  const supabase = await createClient();
  const { data: conversation, error } = await supabase
    .from("job_platform_conversations")
    .select("id, user_a, user_b")
    .eq("id", conversationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!conversation) return null;

  const otherUserId = conversation.user_a === userId ? conversation.user_b : conversation.user_a;

  const [messages, participants] = await Promise.all([
    supabase
      .from("job_platform_messages")
      .select(MESSAGE_COLUMNS)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(THREAD_HISTORY_LIMIT),
    resolveParticipants(supabase, [otherUserId]),
  ]);

  if (messages.error) throw new Error(messages.error.message);

  return {
    id: conversation.id,
    other: participants.get(otherUserId)!,
    messages: messages.data.map(mapMessageRow).reverse(),
  };
}
