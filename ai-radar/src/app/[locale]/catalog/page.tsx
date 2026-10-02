import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogFilters } from "@/components/catalog-filters";
import { Pagination } from "@/components/pagination";
import { SiteGrid } from "@/components/site-card";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { type CatalogFilters as Filters, PAGE_SIZE, catalogHref, parseCatalogParams, toApiParams } from "@/lib/catalog-params";
import { MAX_WINDOW, searchSites } from "@/lib/freeserp";
import { formatDate, formatNumber } from "@/lib/format";
import { builderLabel, categoryLabel } from "@/lib/taxonomy";

export async function generateMetadata(props: PageProps<"/[locale]/catalog">): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as AppLocale, namespace: "catalog" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function CatalogPage(props: PageProps<"/[locale]/catalog">) {
  const { locale } = (await props.params) as { locale: AppLocale };
  setRequestLocale(locale);
  const t = await getTranslations();
  const filters = parseCatalogParams(await props.searchParams);
  const data = await searchSites(toApiParams(filters));

  const reachable = Math.min(data.total, MAX_WINDOW);
  const totalPages = Math.max(1, Math.ceil(reachable / PAGE_SIZE));
  const firstIdx = (filters.page - 1) * PAGE_SIZE + 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t("catalog.title")}</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {t("catalog.found", { count: formatNumber(data.total, locale) })}
          {data.results.length > 0 && (
            <>
              {" · "}
              {t("catalog.shown", {
                from: formatNumber(firstIdx, locale),
                to: formatNumber(firstIdx + data.results.length - 1, locale),
              })}
            </>
          )}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          <CatalogFilters filters={filters} />
        </aside>

        <section className="flex min-w-0 flex-col gap-5" aria-label={t("catalog.results")}>
          <ActiveFilters filters={filters} locale={locale} />
          {data.results.length > 0 ? (
            <>
              <SiteGrid sites={data.results} />
              <Pagination filters={filters} totalPages={totalPages} />
              {data.total > MAX_WINDOW && (
                <p className="text-center text-xs text-fg-subtle">
                  {t("catalog.windowLimit", { max: formatNumber(MAX_WINDOW, locale) })}
                </p>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-line-strong bg-surface-1 p-8 text-center sm:p-10">
              <p className="font-display text-lg font-semibold">{t("catalog.emptyTitle")}</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">{t("catalog.emptyText")}</p>
              <Link href="/catalog" className="mt-4 inline-block text-sm text-accent-text hover:underline">
                {t("catalog.emptyLink")}
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

async function ActiveFilters({ filters, locale }: { filters: Filters; locale: AppLocale }) {
  const t = await getTranslations();
  const chips: { label: string; without: Partial<Filters> }[] = [];
  if (filters.q) chips.push({ label: `«${filters.q}»`, without: { q: "" } });
  if (filters.category) chips.push({ label: categoryLabel(filters.category, locale), without: { category: "" } });
  if (filters.builder)
    chips.push({
      label: t("catalog.chipStack", { name: builderLabel(filters.builder, t("builders.aiLikely")) }),
      without: { builder: "" },
    });
  if (filters.dr) chips.push({ label: `DR ${filters.dr}+`, without: { dr: "" } });
  if (filters.from) chips.push({ label: t("catalog.chipFrom", { date: formatDate(filters.from, locale) }), without: { from: "" } });
  if (filters.to) chips.push({ label: t("catalog.chipTo", { date: formatDate(filters.to, locale) }), without: { to: "" } });
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <Link
          key={c.label}
          href={catalogHref({ ...filters, ...c.without, page: 1 })}
          scroll={false}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-accent-border bg-accent-subtle px-3 py-1 text-xs text-accent-text hover:border-accent"
        >
          <span className="truncate">{c.label}</span> <span aria-hidden="true">×</span>
          <span className="sr-only">{t("catalog.removeFilter")}</span>
        </Link>
      ))}
      <Link href="/catalog" scroll={false} className="text-xs text-fg-subtle hover:text-fg">
        {t("catalog.resetAll")}
      </Link>
    </div>
  );
}
