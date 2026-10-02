import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { type CatalogFilters, catalogHref } from "@/lib/catalog-params";

export function Pagination({ filters, totalPages }: { filters: CatalogFilters; totalPages: number }) {
  const t = useTranslations("catalog");
  if (totalPages <= 1) return null;
  const { page } = filters;
  const pages = pageWindow(page, totalPages);

  const btn = "flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm transition-colors";
  const idle = "border-line text-fg-muted hover:bg-surface-2";
  return (
    <nav aria-label={t("pages")} className="flex flex-wrap items-center justify-center gap-1">
      {page > 1 && (
        <Link href={catalogHref({ ...filters, page: page - 1 })} className={`${btn} ${idle}`} aria-label="Previous">
          ←
        </Link>
      )}
      {pages.map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} className="px-1 text-fg-subtle">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={catalogHref({ ...filters, page: p })}
            aria-current={p === page ? "page" : undefined}
            className={`${btn} ${p === page ? "border-accent-border bg-accent-subtle text-accent-text" : idle}`}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link href={catalogHref({ ...filters, page: page + 1 })} className={`${btn} ${idle}`} aria-label="Next">
          →
        </Link>
      )}
    </nav>
  );
}

function pageWindow(current: number, total: number): (number | null)[] {
  const set = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(null);
    out.push(p);
  });
  return out;
}
