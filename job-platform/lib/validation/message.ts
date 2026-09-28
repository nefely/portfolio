// Спільна для клієнта (кнопка "Надіслати") і server action — ті самі межі,
// що й CHECK на job_platform_messages.body у schema.sql.
export const MESSAGE_MAX_LENGTH = 2000;

export type MessageErrorKey = "messageEmpty" | "messageTooLong";

export function normalizeMessageBody(body: string): string {
  return body.trim();
}

export function validateMessageBody(body: string): MessageErrorKey | undefined {
  const normalized = normalizeMessageBody(body);
  if (normalized.length === 0) return "messageEmpty";
  if (normalized.length > MESSAGE_MAX_LENGTH) return "messageTooLong";
  return undefined;
}
