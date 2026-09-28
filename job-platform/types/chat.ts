// Рядок job_platform_messages у camelCase — спільний для сервера (початкове
// завантаження) і клієнта (Realtime-події, відповідь sendMessage).
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

// Хто "з того боку" розмови. Ім'я береться з публічного профілю кандидата
// чи компанії; якщо профілю немає або його приховано — name = null, і UI
// показує нейтральне "Користувач".
export interface ChatParticipant {
  userId: string;
  name: string | null;
  kind: "candidate" | "employer" | null;
  // Лише для кандидатів — у компаній немає власної сторінки.
  profileSlug?: string;
}

export interface ConversationSummary {
  id: string;
  other: ChatParticipant;
  lastMessageAt: string;
  lastMessageBody: string | null;
  lastMessageFromMe: boolean;
  unreadCount: number;
}

// Кому пишемо, коли розмову ще треба створити. Не user_id напряму — сервер
// сам знаходить власника профілю/вакансії.
export type ChatTarget = { kind: "candidate"; slug: string } | { kind: "job"; id: string };

export type ChatActionError = "forbidden" | "notFound" | "self" | "invalid" | "failed";
