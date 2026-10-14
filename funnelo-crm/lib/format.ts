// Форматери створюються один раз: Intl.*Format дорогі в конструюванні, а
// викликаються в кожному рядку таблиці й кожній картці канбану.

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const moneyCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const shortDateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short" });
const relative = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

export function formatMoney(value: number | null | undefined) {
  return money.format(value ?? 0);
}

export function formatMoneyCompact(value: number | null | undefined) {
  return moneyCompact.format(value ?? 0);
}

/** "2026-10-14" (date) або ISO-timestamp → "Oct 14, 2026". */
export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return dateFormat.format(parseDate(value));
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return "—";
  return shortDateFormat.format(parseDate(value));
}

export function formatTime(value: string) {
  return timeFormat.format(new Date(value));
}

/** "2026-03" → "Mar". */
export function formatMonth(month: string) {
  const [year, m] = month.split("-").map(Number);
  return monthFormat.format(new Date(year, m - 1, 1));
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "3 days ago", "in 2 hours", "now". */
export function formatRelative(value: string, now = Date.now()) {
  const seconds = (new Date(value).getTime() - now) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

/**
 * Колонка `date` ("2026-10-14") через new Date() стала б північчю UTC — і в
 * часових поясах на захід від Гринвіча показувалась би вчорашньою датою.
 * Тому дату без часу розбираємо як локальну.
 */
function parseDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}

/** Сьогоднішня дата як "YYYY-MM-DD" у локальному поясі (для input[type=date]). */
export function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
