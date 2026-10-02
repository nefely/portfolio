// Locale-aware formatting helpers (locale: "uk" | "en").

const tag = (locale: string) => (locale === "uk" ? "uk-UA" : "en-US");

export function formatNumber(n: number | null | undefined, locale: string): string {
  return n == null ? "—" : new Intl.NumberFormat(tag(locale)).format(n);
}

export function formatCompact(n: number | null | undefined, locale: string): string {
  return n == null ? "—" : new Intl.NumberFormat(tag(locale), { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(tag(locale), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d);
}

export function formatBytes(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** YYYY-MM-DD for `days` ago (UTC), as expected by FreeSerp `from_date`. */
export function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

export function drTone(dr: number | null | undefined): "high" | "mid" | "low" | "none" {
  if (dr == null) return "none";
  if (dr >= 40) return "high";
  if (dr >= 15) return "mid";
  return "low";
}
