import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BarList } from "@/components/bar-list";
import { DailyBarChart } from "@/components/daily-bar-chart";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { SiteGrid } from "@/components/site-card";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { catalogHref } from "@/lib/catalog-params";
import { formatDate, formatNumber } from "@/lib/format";
import { getNicheData } from "@/lib/niche";
import { categoryFromSlug, categoryLabel } from "@/lib/taxonomy";

export async function generateMetadata(props: PageProps<"/[locale]/niches/[slug]">): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const category = categoryFromSlug(slug);
  if (!category) return {};
  const label = categoryLabel(category, locale);
  const t = await getTranslations({ locale: locale as AppLocale, namespace: "niche" });
  return { title: `${t("eyebrow")}: ${label}` };
}

export default async function NichePage(props: PageProps<"/[locale]/niches/[slug]">) {
  const { locale, slug } = (await props.params) as { locale: AppLocale; slug: string };
  setRequestLocale(locale);
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const t = await getTranslations();
  const data = await getNicheData(category);
  const label = categoryLabel(category, locale);
  const pct = new Intl.NumberFormat(locale === "uk" ? "uk-UA" : "en-US", { style: "percent", maximumFractionDigits: 1 });
  const chartTotal = data.daily.reduce((s, d) => s + d.count, 0);
  const avg = data.daily.length ? chartTotal / data.daily.length : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/niches" className="text-sm text-fg-muted hover:text-fg">
        {t("niche.back")}
      </Link>

      <Reveal as="section" className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-widest text-accent-text">{t("niche.eyebrow")}</p>
          <h1 className="mt-1 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">{label}</h1>
          {label !== category && <p className="mt-1 text-sm text-fg-subtle">{category}</p>}
        </div>
        <Link
          href={catalogHref({ category })}
          className="inline-flex h-10 shrink-0 items-center self-start rounded-lg bg-accent px-4 text-sm font-medium text-on-accent hover:bg-accent-hover sm:self-auto"
        >
          {t("niche.openCatalog")}
        </Link>
      </Reveal>

      <Stagger className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t("niche.statTotal")} value={formatNumber(data.total, locale)} note={`ai_categories`} />
        <Stat
          label={t("niche.statShare")}
          value={pct.format(data.share)}
          note={data.rank ? t("niche.statRank", { rank: data.rank }) : "—"}
        />
        <Stat
          label={t("niche.stat30")}
          value={formatNumber(data.last30, locale)}
          note={t("niche.stat30Note", { date: formatDate(data.from30, locale) })}
          accent
        />
        <Stat
          label={t("niche.statAvg")}
          value={avg ? new Intl.NumberFormat(locale === "uk" ? "uk-UA" : "en-US", { maximumFractionDigits: 1 }).format(avg) : "—"}
          note={t("niche.statAvgNote")}
        />
      </Stagger>

      <Reveal as="section" className="mt-6 rounded-xl border border-line bg-surface-1 p-4 sm:p-6">
        <h2 className="font-display text-base font-semibold">{t("niche.chartTitle")}</h2>
        {data.daily.length > 0 ? (
          <>
            <p className="mb-4 text-xs text-fg-subtle">
              {t("niche.chartSubtitle", {
                from: formatDate(data.daily[0].date, locale),
                to: formatDate(data.daily[data.daily.length - 1].date, locale),
              })}
            </p>
            <DailyBarChart data={data.daily} locale={locale} title={`${t("niche.chartTitle")}: ${label}`} valueLabel={t("niche.chartValue")} />
            <p className="mt-4 border-t border-line pt-3 text-xs text-fg-subtle">{t("niche.chartNote")}</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-fg-muted">{t("niche.chartEmpty")}</p>
        )}
      </Reveal>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Reveal as="section" className="min-w-0 rounded-xl border border-line bg-surface-1 p-4 lg:self-start">
          <h2 className="font-display text-base font-semibold">{t("niche.buildersTitle")}</h2>
          <p className="mb-3 text-xs text-fg-subtle">{t("niche.buildersSubtitle")}</p>
          {data.builders.length > 0 ? (
            <BarList
              items={data.builders.map((b) => ({
                label: b.label ?? t("builders.aiLikely"),
                value: b.count,
                href: catalogHref({ category, builder: b.key }),
                hint: t(`builders.${b.hint}`),
              }))}
            />
          ) : (
            <p className="text-sm text-fg-muted">{t("niche.buildersEmpty")}</p>
          )}
        </Reveal>

        <Reveal as="section" className="min-w-0">
          <SectionHeader title={t("niche.leadersTitle")} href={catalogHref({ category, sort: "dr" })} linkLabel={t("common.all")} />
          <SiteGrid sites={data.leaders} columns={2} />
        </Reveal>
      </div>

      <Reveal as="section" className="mt-12">
        <SectionHeader title={t("niche.latestTitle")} href={catalogHref({ category })} linkLabel={t("common.all")} />
        <SiteGrid sites={data.latest} />
      </Reveal>
    </div>
  );
}

function Stat({ label, value, note, accent }: { label: string; value: string; note: string; accent?: boolean }) {
  return (
    <StaggerItem className="min-w-0 rounded-xl border border-line bg-surface-1 p-4">
      <p className="text-xs text-fg-muted">{label}</p>
      <p className={`mt-1 truncate font-display text-2xl font-semibold sm:text-3xl ${accent ? "text-accent" : ""}`}>{value}</p>
      <p className="mt-1 truncate font-mono text-[11px] text-fg-subtle">{note}</p>
    </StaggerItem>
  );
}

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="min-w-0 font-display text-xl font-semibold tracking-tight">{title}</h2>
      <Link href={href} className="shrink-0 text-sm text-accent-text hover:underline">
        {linkLabel}
      </Link>
    </div>
  );
}
