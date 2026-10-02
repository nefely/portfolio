import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CategoryChip, DrBadge } from "@/components/badges";
import { CompareAddForm, CompareClearButton, CompareRemoveButton, CompareSync } from "@/components/compare-controls";
import { Favicon } from "@/components/favicon";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { type Site, getSite, normalizeDomain } from "@/lib/freeserp";
import { formatBytes, formatDate } from "@/lib/format";
import { MAX_COMPARE, builderLabel } from "@/lib/taxonomy";

export async function generateMetadata(props: PageProps<"/[locale]/compare">): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as AppLocale, namespace: "compare" });
  return { title: t("metaTitle") };
}

export default async function ComparePage(props: PageProps<"/[locale]/compare">) {
  const { locale } = (await props.params) as { locale: AppLocale };
  setRequestLocale(locale);
  const t = await getTranslations();
  const sp = await props.searchParams;
  const raw = typeof sp.d === "string" ? sp.d : "";
  const domains = [...new Set(raw.split(",").map(normalizeDomain).filter(Boolean))].slice(0, MAX_COMPARE);

  const entries = await Promise.all(domains.map(async (domain) => ({ domain, site: await getSite(domain) })));
  const sites = entries.map((e) => e.site).filter((s): s is Site => s !== null);

  const maxDr = Math.max(...sites.map((s) => s.dr ?? -1));
  const earliest = sites
    .map((s) => s.went_live)
    .filter(Boolean)
    .sort()[0];

  type Row = { label: string; render: (s: Site) => React.ReactNode; highlight?: (s: Site) => string | null };
  const rows: Row[] = [
    {
      label: t("site.dr"),
      render: (s) => <DrBadge dr={s.dr} />,
      highlight: (s) => (sites.length > 1 && s.dr != null && s.dr === maxDr ? t("compare.best") : null),
    },
    {
      label: t("site.wentLive"),
      render: (s) => formatDate(s.went_live, locale),
      highlight: (s) => (sites.length > 1 && s.went_live && s.went_live === earliest ? t("compare.earliest") : null),
    },
    { label: t("site.firstSeen"), render: (s) => formatDate(s.first_seen, locale) },
    {
      label: t("site.builder"),
      render: (s) => builderLabel(s.ai_source === "not_ai" ? null : s.ai_source, t("builders.aiLikely")),
    },
    { label: t("site.server"), render: (s) => s.webserver ?? "—" },
    { label: t("site.tld"), render: (s) => (s.tld ? `.${s.tld}` : "—") },
    { label: t("site.contentSize"), render: (s) => formatBytes(s.content_length) },
    {
      label: t("site.categories"),
      render: (s) => (
        <div className="flex flex-wrap gap-1">
          {(s.ai_categories ?? []).map((c) => (
            <CategoryChip key={c} name={c} />
          ))}
        </div>
      ),
    },
    {
      label: t("compare.summary"),
      render: (s) => <p className="line-clamp-6 text-xs leading-relaxed text-fg-muted">{s.ai_summary ?? "—"}</p>,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CompareSync urlDomains={domains} />
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t("compare.title")}</h1>
          <p className="mt-1 text-sm text-fg-muted">{t("compare.subtitle")}</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 lg:w-auto">
          <CompareAddForm urlDomains={domains} />
          {domains.length > 0 && <CompareClearButton />}
        </div>
      </header>

      {domains.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface-1 p-8 text-center sm:p-10">
          <p className="font-display text-lg font-semibold">{t("compare.emptyTitle")}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">{t("compare.emptyText")}</p>
          <Link href="/catalog" className="mt-4 inline-block text-sm text-accent-text hover:underline">
            {t("compare.toCatalog")}
          </Link>
        </div>
      ) : (
        // the table scrolls inside its own container on small screens — never the page
        <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
          <table className="w-full min-w-160 table-fixed border-collapse text-sm">
            <colgroup>
              <col className="w-36" />
              {entries.map((e) => (
                <col key={e.domain} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="p-4 text-left text-xs font-medium text-fg-subtle">
                  {t("compare.metric")}
                </th>
                {entries.map(({ domain, site }) => (
                  <th key={domain} scope="col" className="p-4 text-left align-top font-normal">
                    <div className="flex items-start gap-3">
                      <Favicon domain={domain} size={36} />
                      <div className="min-w-0">
                        {site ? (
                          <Link href={`/site/${encodeURIComponent(domain)}`} className="block truncate font-display font-semibold hover:text-accent-text">
                            {domain}
                          </Link>
                        ) : (
                          <span className="block truncate font-display font-semibold text-fg-subtle">{domain}</span>
                        )}
                        <CompareRemoveButton domain={domain} urlDomains={domains} />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-line last:border-0">
                  <th scope="row" className="p-4 text-left align-top text-xs font-medium text-fg-muted">
                    {row.label}
                  </th>
                  {entries.map(({ domain, site }) => {
                    const mark = site && row.highlight?.(site);
                    return (
                      <td key={domain} className={`p-4 align-top ${mark ? "bg-accent-subtle" : ""}`}>
                        {site ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-fg">{row.render(site)}</span>
                            {mark && <span className="text-[11px] font-medium text-accent-text">★ {mark}</span>}
                          </div>
                        ) : (
                          <span className="text-xs text-fg-subtle">{t("compare.notFound")}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
