import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/motion";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

type Audience = { name: string; need: string };
type PageInfo = { path: string; name: string; text: string };
type ApiUse = { param: string; text: string };

export async function generateMetadata(props: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as AppLocale, namespace: "about" });
  return { title: t("metaTitle") };
}

export default async function AboutPage(props: PageProps<"/[locale]/about">) {
  const { locale } = await props.params;
  setRequestLocale(locale as AppLocale);
  const t = await getTranslations("about");

  const goal = t.raw("goal") as string[];
  const audience = t.raw("audience") as Audience[];
  const pages = t.raw("pages") as PageInfo[];
  const structure = t.raw("structure") as string[];
  const api = t.raw("api") as ApiUse[];
  const caveats = t.raw("caveats") as string[];

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <p className="font-mono text-xs uppercase tracking-widest text-accent-text">{t("eyebrow")}</p>
      <h1 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-pretty text-lg text-fg-muted">{t("lead")}</p>

      <Section title={t("goalTitle")}>
        <BulletList items={goal} />
      </Section>

      <Section title={t("audienceTitle")}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {audience.map((a) => (
            <div key={a.name} className="rounded-xl border border-line bg-surface-1 p-4">
              <p className="font-display font-semibold">{a.name}</p>
              <p className="mt-1 text-sm text-fg-muted">{a.need}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("pagesTitle")}>
        <SiteMap pages={pages} />
        <ul className="mt-5 flex flex-col divide-y divide-line rounded-xl border border-line bg-surface-1">
          {pages.map((p) => (
            <li key={p.path} className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-4">
              <div className="shrink-0 sm:w-48">
                <p className="font-display font-semibold">{p.name}</p>
                <code className="font-mono text-xs text-accent-text">{p.path}</code>
              </div>
              <p className="text-sm text-fg-muted">{p.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t("structureTitle")}>
        <BulletList items={structure} />
      </Section>

      <Section title={t("apiTitle")}>
        <div className="overflow-hidden rounded-xl border border-line bg-surface-1">
          {api.map((a) => (
            <div key={a.param} className="flex flex-col gap-1 border-b border-line p-3 last:border-0 sm:flex-row sm:gap-4">
              <code className="shrink-0 font-mono text-xs text-accent-text sm:w-56">{a.param}</code>
              <span className="text-sm text-fg-muted">{a.text}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("caveatsTitle")}>
        <BulletList items={caveats} />
      </Section>

      <div className="mt-12">
        <Link href="/catalog" className="inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-medium text-on-accent hover:bg-accent-hover">
          → /catalog
        </Link>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="mt-12">
      <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </Reveal>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-fg-muted">
          <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Small tree diagram of the routes: Home on top, user flows below. */
function SiteMap({ pages }: { pages: PageInfo[] }) {
  const [home, ...rest] = pages;
  return (
    <div className="rounded-xl border border-line bg-surface-1 p-4 sm:p-6">
      <div className="flex justify-center">
        <Node page={home} primary />
      </div>
      <div aria-hidden="true" className="mx-auto my-3 h-5 w-px bg-line-strong" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {rest.map((p) => (
          <Node key={p.path} page={p} />
        ))}
      </div>
    </div>
  );
}

function Node({ page, primary = false }: { page: PageInfo; primary?: boolean }) {
  return (
    <div
      className={`min-w-0 rounded-lg border px-3 py-2 text-center ${
        primary ? "border-accent-border bg-accent-subtle" : "border-line bg-surface-2"
      }`}
    >
      <p className="truncate text-sm font-medium">{page.name}</p>
      <p className="truncate font-mono text-[11px] text-fg-subtle">{page.path}</p>
    </div>
  );
}
