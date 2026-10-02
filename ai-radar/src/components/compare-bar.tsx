"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { MAX_COMPARE, useCompare } from "@/lib/list-store";

/** Floating tray showing the current compare selection. */
export function CompareBar() {
  const t = useTranslations();
  const compare = useCompare();
  const pathname = usePathname();

  if (compare.items.length === 0 || pathname === "/compare") return null;

  const href = `/compare?d=${compare.items.map(encodeURIComponent).join(",")}`;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div className="glass pointer-events-auto flex min-w-0 max-w-full items-center gap-3 rounded-xl border border-line-strong py-2 pl-3 pr-2 shadow-2xl shadow-black/30">
        <span className="hidden shrink-0 text-xs text-fg-subtle sm:inline">
          {t("header.compare")} {compare.items.length}/{MAX_COMPARE}
        </span>
        <div className="flex min-w-0 gap-1.5 overflow-x-auto">
          {compare.items.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => compare.remove(d)}
              className="shrink-0 rounded-md border border-line bg-surface-2 px-2 py-1 text-xs text-fg-muted hover:text-danger"
              title={t("common.remove")}
            >
              {d} ×
            </button>
          ))}
        </div>
        <Link
          href={href}
          className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-on-accent hover:bg-accent-hover"
        >
          {t("common.addToCompare")} →
        </Link>
      </div>
    </div>
  );
}
