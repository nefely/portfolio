import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Site } from "@/lib/freeserp";
import { formatDate } from "@/lib/format";
import { builderLabel } from "@/lib/taxonomy";
import { CategoryChip, DrBadge, MetaChip } from "./badges";
import { CompareToggle } from "./compare-toggle";
import { FavoriteToggle } from "./favorite-toggle";
import { Favicon } from "./favicon";
import { Stagger, StaggerItem } from "./motion";

export function SiteCard({ site }: { site: Site }) {
  const t = useTranslations();
  const locale = useLocale();
  const categories = site.ai_categories ?? [];

  return (
    <article className="group relative flex w-full min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface-1 p-4 transition-colors hover:border-line-strong hover:bg-surface-2">
      <div className="flex items-start gap-3">
        <Favicon domain={site.domain} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[15px] font-semibold">
            <Link href={`/site/${encodeURIComponent(site.domain)}`} className="after:absolute after:inset-0">
              {site.domain}
            </Link>
          </h3>
          <p className="truncate text-xs text-fg-subtle">{site.title ?? t("common.noTitle")}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <FavoriteToggle domain={site.domain} />
          <CompareToggle domain={site.domain} />
        </div>
      </div>

      <p className="line-clamp-3 wrap-break-word text-sm leading-relaxed text-fg-muted">{site.ai_summary ?? t("common.noSummary")}</p>

      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        <DrBadge dr={site.dr} />
        {site.ai_source && site.ai_source !== "not_ai" && (
          <MetaChip>{builderLabel(site.ai_source, t("builders.aiLikely"))}</MetaChip>
        )}
        <MetaChip title={t("site.wentLive")}>
          <CalendarIcon />
          {formatDate(site.went_live, locale)}
        </MetaChip>
      </div>

      {categories.length > 0 && (
        <div className="relative z-10 flex flex-wrap gap-1">
          {categories.slice(0, 3).map((c) => (
            <CategoryChip key={c} name={c} size="sm" />
          ))}
        </div>
      )}
    </article>
  );
}

export function SiteGrid({ sites, columns = 3 }: { sites: Site[]; columns?: 2 | 3 }) {
  return (
    // key: replay the cascade when the result set changes (new filters / page)
    <Stagger
      key={sites.map((s) => s.domain).join()}
      className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : ""}`}
    >
      {sites.map((s) => (
        <StaggerItem key={s.domain} className="flex min-w-0">
          <SiteCard site={s} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}
