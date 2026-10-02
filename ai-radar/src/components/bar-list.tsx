import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/format";

export type BarItem = { label: string; value: number; href: string; hint?: string };

/** Horizontal ranked bars — one hue, length encodes value, exact number on the right. */
export function BarList({ items }: { items: BarItem[] }) {
  const locale = useLocale();
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item.label}>
          <Link
            href={item.href}
            title={item.hint}
            className="group relative flex h-9 items-center justify-between gap-3 overflow-hidden rounded-md px-3 text-sm hover:bg-surface-2"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-1 left-0 rounded-r-sm bg-accent/15 transition-colors group-hover:bg-accent/25"
              style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }}
            />
            <span className="relative min-w-0 truncate text-fg">{item.label}</span>
            <span className="relative shrink-0 font-mono text-xs text-fg-muted">{formatNumber(item.value, locale)}</span>
          </Link>
        </li>
      ))}
    </ul>
    
  );
}
