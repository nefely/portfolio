import type { ChatMessage } from "@/types/chat";

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export const MESSAGE_COLUMNS = "id, conversation_id, sender_id, body, created_at";

// Спільне для сервера (select) і клієнта (payload.new з Realtime-події —
// той самий рядок таблиці в snake_case).
export function mapMessageRow(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
  };
}
