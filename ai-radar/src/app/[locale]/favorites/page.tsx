import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FavoritesView } from "@/components/favorites-view";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata(props: PageProps<"/[locale]/favorites">): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as AppLocale, namespace: "favorites" });
  return { title: t("metaTitle") };
}

export default async function FavoritesPage(props: PageProps<"/[locale]/favorites">) {
  const { locale } = await props.params;
  setRequestLocale(locale as AppLocale);
  const t = await getTranslations("favorites");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("subtitle")}</p>
      </header>
      <FavoritesView />
    </div>
  );
}
