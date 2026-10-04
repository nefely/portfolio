const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const absolute = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

export function formatRelativeDate(iso: string, now: number = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  // Старше за рік — точна дата читається краще за "2 years ago".
  if (Math.abs(seconds) >= 365 * 24 * 3600) return absolute.format(new Date(iso));
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.trunc(seconds / size), unit);
  }
  return "just now";
}
