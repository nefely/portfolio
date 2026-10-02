import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Stagger, StaggerItem } from "@/components/motion";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getStats } from "@/lib/freeserp";
import { formatNumber } from "@/lib/format";
import { nicheRank } from "@/lib/niche";
import { AI_CATEGORIES, categoryLabel, categorySlug } from "@/lib/taxonomy";

export const revalidate = 600;

export async function generateMetadata(props: PageProps<"/[locale]/niches">): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as AppLocale, namespace: "niches" });
  return { title: t("metaTitle") };
}

export default async function NichesPage(props: PageProps<"/[locale]/niches">) {
  const { locale } = (await props.params) as { locale: AppLocale };
  setRequestLocale(locale);
  const t = await getTranslations("niches");
  const stats = await getStats();
  const pct = new Intl.NumberFormat(locale === "uk" ? "uk-UA" : "en-US", { style: "percent", maximumFractionDigits: 1 });

  // stats lists the top niches with counts; keep only the ones we have pages for,
  // and move the catch-all "Other AI" bucket to the end
  const niches = stats.top_ai_categories
    .filter((c) => (AI_CATEGORIES as readonly string[]).includes(c.key))
    .sort((a, b) => Number(a.key === "Other AI") - Number(b.key === "Other AI"));
  const max = Math.max(...niches.map((n) => n.count), 1);
  const total = stats.ai_startups.total || 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
        <p className="mt-1 max-w-2xl text-sm text-fg-muted">{t("subtitle")}</p>
      </header>

      <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {niches.map((n) => (
          <StaggerItem key={n.key} className="flex min-w-0">
            <Link
              href={`/niches/${categorySlug(n.key)}`}
              className="group flex w-full min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface-1 p-4 transition-colors hover:border-line-strong hover:bg-surface-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display font-semibold group-hover:text-accent-text">{categoryLabel(n.key, locale)}</p>
                  {locale === "uk" && <p className="truncate text-xs text-fg-subtle">{n.key}</p>}
                </div>
                {nicheRank(niches, n.key) && <span className="shrink-0 font-mono text-xs text-fg-subtle">#{nicheRank(niches, n.key)}</span>}
              </div>
              {/* share bar: length encodes the count relative to the biggest niche */}
              <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-chart-1" style={{ width: `${Math.max((n.count / max) * 100, 2)}%` }} />
              </div>
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="text-fg">{t("products", { count: formatNumber(n.count, locale) })}</span>
                <span className="text-fg-subtle">{t("share", { share: pct.format(n.count / total) })}</span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
