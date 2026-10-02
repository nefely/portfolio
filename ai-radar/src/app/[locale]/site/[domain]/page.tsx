import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CategoryChip, DrBadge } from "@/components/badges";
import { CompareToggle } from "@/components/compare-toggle";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { Favicon } from "@/components/favicon";
import { SiteGrid } from "@/components/site-card";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getSite, searchSites } from "@/lib/freeserp";
import { formatBytes, formatDate } from "@/lib/format";
import { builderLabel, categoryLabel } from "@/lib/taxonomy";

// dedupe between generateMetadata and the page render
const loadSite = cache((domain: string) => getSite(decodeURIComponent(domain)));

export async function generateMetadata(props: PageProps<"/[locale]/site/[domain]">): Promise<Metadata> {
  const { domain } = await props.params;
  const site = await loadSite(domain);
  if (!site) return { title: decodeURIComponent(domain) };
  return { title: site.domain, description: site.ai_summary ?? site.title ?? undefined };
}

export default async function SitePage(props: PageProps<"/[locale]/site/[domain]">) {
  const { locale, domain } = (await props.params) as { locale: AppLocale; domain: string };
  setRequestLocale(locale);
  const t = await getTranslations();
  const site = await loadSite(domain);
  if (!site) notFound();

  const categories = site.ai_categories ?? [];
  const mainCategory = categories[0];
  const similar = mainCategory
    ? (await searchSites({ aiCategory: mainCategory, sort: "dr", order: "desc", size: 7 })).results
        .filter((s) => s.domain !== site.domain)
        .slice(0, 6)
    : [];

  const facts: [string, React.ReactNode][] = [
    [t("site.dr"), <DrBadge key="dr" dr={site.dr} />],
    [t("site.wentLive"), formatDate(site.went_live, locale)],
    [t("site.firstSeen"), formatDate(site.first_seen, locale)],
    [t("site.builder"), builderLabel(site.ai_source === "not_ai" ? null : site.ai_source, t("builders.aiLikely"))],
    [t("site.server"), site.webserver ?? "—"],
    [t("site.tld"), site.tld ? `.${site.tld}` : "—"],
    [t("site.status"), site.http_status ?? "—"],
    [t("site.contentSize"), formatBytes(site.content_length)],
    [t("site.fetched"), formatDate(site.fetched_at, locale)],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/catalog" className="text-sm text-fg-muted hover:text-fg">
        {t("site.back")}
      </Link>

      <header className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
        <Favicon domain={site.domain} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="break-all font-display text-2xl font-semibold tracking-tight sm:text-3xl">{site.domain}</h1>
          <p className="mt-1 text-fg-muted">{site.title ?? t("common.noTitle")}</p>
          {categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <CategoryChip key={c} name={c} />
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={site.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent hover:bg-accent-hover"
          >
            {t("site.visit")}
          </a>
          <FavoriteToggle domain={site.domain} variant="button" />
          <CompareToggle domain={site.domain} variant="button" />
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 rounded-xl border border-line bg-surface-1 p-5">
          <h2 className="font-display text-base font-semibold">{t("site.summary")}</h2>
          <p className="mt-3 wrap-break-word leading-relaxed text-fg-muted">{site.ai_summary ?? t("common.noSummary")}</p>
          <p className="mt-6 border-t border-line pt-4 text-xs text-fg-subtle">{t("site.dataNote")}</p>
        </section>

        <section className="min-w-0 rounded-xl border border-line bg-surface-1 p-5">
          <h2 className="font-display text-base font-semibold">{t("site.facts")}</h2>
          <dl className="mt-3 divide-y divide-line text-sm">
            {facts.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2">
                <dt className="text-fg-muted">{label}</dt>
                <dd className="min-w-0 truncate text-right font-mono text-xs text-fg">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {mainCategory && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">
            {t("site.similar", { category: categoryLabel(mainCategory, locale) })}
          </h2>
          {similar.length > 0 ? <SiteGrid sites={similar} /> : <p className="text-sm text-fg-muted">{t("site.similarEmpty")}</p>}
        </section>
      )}
    </div>
  );
}
