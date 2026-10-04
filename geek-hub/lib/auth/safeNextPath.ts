// `next` приходить із query-рядка (/login?next=...) — тобто його контролює
// будь-хто, хто надіслав посилання. Пропускаємо лише внутрішні шляхи, щоб
// логін не перетворювався на open redirect (/login?next=https://evil.com).
// "//evil.com" і "/\evil.com" браузер теж трактує як інший хост.
export function safeNextPath(next: unknown, fallback: string): string {
  if (typeof next !== "string" || next === "") return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
