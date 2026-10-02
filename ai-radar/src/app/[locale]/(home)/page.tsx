import { getTranslations, setRequestLocale } from "next-intl/server";
import { BarList } from "@/components/bar-list";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { RadarSweep } from "@/components/radar-sweep";
import { SearchBox } from "@/components/search-box";
import { SiteGrid } from "@/components/site-card";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { catalogHref } from "@/lib/catalog-params";
import { countSites, getStats, searchSites } from "@/lib/freeserp";
import { daysAgoISO, formatCompact, formatDate, formatNumber } from "@/lib/format";
import { BUILDERS, categoryLabel, categorySlug } from "@/lib/taxonomy";

// Home data changes slowly (FreeSerp refreshes stats every 30 min).
export const revalidate = 600;

const POPULAR_QUERIES = ["voice agent", "video editing", "legal", "recruiting", "crm", "image generator"];

export default async function HomePage(props: PageProps<"/[locale]">) {
  const { locale } = (await props.params) as { locale: AppLocale };
  setRequestLocale(locale);
  const t = await getTranslations();
  const from30 = daysAgoISO(30);

  const [stats, latest, leaders, last30, builderCounts] = await Promise.all([
    getStats(),
    searchSites({ sort: "went_live", order: "desc", size: 6 }),
    searchSites({ sort: "dr", order: "desc", size: 6 }),
    countSites({ fromDate: from30 }),
    Promise.all(BUILDERS.map(async (b) => ({ ...b, count: await countSites({ aiSource: b.key }) }))),
  ]);

  const niches = stats.top_ai_categories.filter((c) => c.key !== "Other AI").slice(0, 10);
  const newestDate = latest.results[0]?.went_live;

  return (
    <>
      {/* Hero: purpose and audience in one line; the full site plan lives on /about */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="bg-dot-grid absolute inset-0 mask-[radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="absolute -top-40 left-1/2 h-80 w-160 max-w-[150vw] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <RadarSweep />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-14 pt-14 text-center sm:pb-16 sm:pt-24">
          <Reveal>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-subtle px-3 py-1 text-xs text-accent-text">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              {t("home.badge", { count: formatNumber(stats.ai_startups.total, locale) })}
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="text-balance font-display text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {t("home.titleStart")}{" "}
              <span className="bg-linear-135 from-accent via-[oklch(66%_0.15_220)] to-amber box-decoration-clone bg-clip-text whitespace-nowrap text-transparent">
                {t("home.titleAccent")}
              </span>{" "}
              {t("home.titleEnd")}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-4 max-w-xl text-pretty text-base text-fg-muted sm:text-lg">{t("home.subtitle")}</p>
          </Reveal>
          <Reveal delay={0.24} className="mt-8 w-full max-w-2xl">
            <SearchBox />
          </Reveal>
          <Reveal delay={0.32} className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            <span className="text-fg-subtle">{t("home.popular")}</span>
            {POPULAR_QUERIES.map((q) => (
              <Link
                key={q}
                href={catalogHref({ q })}
                className="rounded-full border border-line bg-surface-1 px-2.5 py-0.5 text-fg-muted hover:border-line-strong hover:text-fg"
              >
                {q}
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 pt-10 sm:gap-16 sm:pt-12">
        <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label={t("home.statTotal")} value={formatNumber(stats.ai_startups.total, locale)} note="ai_startups=1" />
          <StatTile
            label={t("home.stat30")}
            value={formatNumber(last30, locale)}
            note={t("home.stat30Note", { date: formatDate(from30, locale) })}
            accent
          />
          <StatTile label={t("home.stat7")} value={formatCompact(stats.new.last_7d, locale)} note={t("home.stat7Note")} />
          <StatTile label={t("home.statLive")} value={formatCompact(stats.totals.real_sites, locale)} note="index=sites" />
        </Stagger>

        <Reveal as="section">
          <SectionHeader
            title={t("home.latestTitle")}
            subtitle={newestDate ? t("home.latestSubtitle", { date: formatDate(newestDate, locale) }) : undefined}
            href={catalogHref({ sort: "went_live" })}
            linkLabel={t("common.all")}
          />
          <SiteGrid sites={latest.results} />
        </Reveal>

        <Reveal as="section" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel title={t("home.nichesTitle")} subtitle={t("home.nichesSubtitle")} href="/niches" linkLabel={t("common.all")}>
            <BarList
              items={niches.map((n) => ({
                label: categoryLabel(n.key, locale),
                value: n.count,
                href: `/niches/${categorySlug(n.key)}`,
              }))}
            />
          </Panel>
          <Panel title={t("home.buildersTitle")} subtitle={t("home.buildersSubtitle")}>
            <BarList
              items={builderCounts
                .filter((b) => b.count > 0)
                .sort((a, b) => b.count - a.count)
                .map((b) => ({
                  label: b.label ?? t("builders.aiLikely"),
                  value: b.count,
                  href: catalogHref({ builder: b.key }),
                  hint: t(`builders.${b.hint}`),
                }))}
            />
          </Panel>
        </Reveal>

        <Reveal as="section">
          <SectionHeader
            title={t("home.leadersTitle")}
            subtitle={t("home.leadersSubtitle")}
            href={catalogHref({ sort: "dr" })}
            linkLabel={t("common.all")}
          />
          <SiteGrid sites={leaders.results} />
        </Reveal>

        <Reveal
          as="section"
          className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface-1 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div>
            <h2 className="font-display text-xl font-semibold">{t("home.ctaTitle")}</h2>
            <p className="mt-1 text-sm text-fg-muted">{t("home.ctaText")}</p>
          </div>
          <Link
            href="/compare"
            className="shrink-0 rounded-lg border border-accent-border bg-accent-subtle px-4 py-2 text-sm font-medium text-accent-text hover:bg-accent/20"
          >
            {t("home.ctaButton")}
          </Link>
        </Reveal>
      </div>
    </>
  );
}

function StatTile({ label, value, note, accent }: { label: string; value: string; note: string; accent?: boolean }) {
  return (
    <StaggerItem className="min-w-0 rounded-xl border border-line bg-surface-1 p-4">
      <p className="text-xs text-fg-muted">{label}</p>
      <p className={`mt-1 truncate font-display text-2xl font-semibold tabular-nums sm:text-3xl ${accent ? "text-accent" : ""}`}>
        {value}
      </p>
      <p className="mt-1 truncate font-mono text-[11px] text-fg-subtle">{note}</p>
    </StaggerItem>
  );
}

function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel,
}: {
  title: string;
  subtitle?: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-fg-muted">{subtitle}</p>}
      </div>
      <Link href={href} className="shrink-0 text-sm text-accent-text hover:underline">
        {linkLabel}
      </Link>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  href,
  linkLabel,
  children,
}: {
  title: string;
  subtitle: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-surface-1 p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {href && linkLabel && (
          <Link href={href} className="shrink-0 text-sm text-accent-text hover:underline">
            {linkLabel}
          </Link>
        )}
      </div>
      <p className="mb-3 text-xs text-fg-subtle">{subtitle}</p>
      {children}
    </div>
  );
}
