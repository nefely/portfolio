import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { catalogHref } from "@/lib/catalog-params";
import { drTone } from "@/lib/format";
import { AI_CATEGORIES, categoryLabel, categorySlug } from "@/lib/taxonomy";

const DR_STYLES = {
  high: "border-success/30 bg-success-subtle text-success",
  mid: "border-warning/30 bg-warning-subtle text-warning",
  low: "border-line bg-surface-3 text-fg-muted",
  none: "border-line bg-surface-3 text-fg-subtle",
} as const;

export function DrBadge({ dr }: { dr: number | null }) {
  const t = useTranslations("common");
  return (
    <span
      title={t("drHint")}
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-xs ${DR_STYLES[drTone(dr)]}`}
    >
      DR {dr ?? "—"}
    </span>
  );
}

export function CategoryChip({ name, linked = true, size = "md" }: { name: string; linked?: boolean; size?: "sm" | "md" }) {
  const locale = useLocale();
  const label = categoryLabel(name, locale);
  // sm: compact pills for cards, where up to 3 niches share one narrow row
  const sizeCls = size === "sm" ? "px-1.5 py-px text-[10px] leading-4" : "px-2 py-0.5 text-xs";
  const cls = `inline-flex max-w-full items-center truncate rounded-full border border-accent-border bg-accent-subtle text-accent-text ${sizeCls}`;
  if (!linked) return <span className={cls}>{label}</span>;
  // known niches get their own page; rarer API categories fall back to a catalog filter
  const known = (AI_CATEGORIES as readonly string[]).includes(name);
  return (
    <Link href={known ? `/niches/${categorySlug(name)}` : catalogHref({ category: name })} className={`${cls} hover:border-accent`}>
      {label}
    </Link>
  );
}

export function MetaChip({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-xs text-fg-muted"
    >
      {children}
    </span>
  );
}
