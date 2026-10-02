import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/login-form";
import type { AppLocale } from "@/i18n/routing";
import { safeNextPath } from "@/lib/safe-next";

export async function generateMetadata(props: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as AppLocale, namespace: "login" });
  return { title: t("metaTitle") };
}

export default async function LoginPage(props: PageProps<"/[locale]/login">) {
  const { locale } = await props.params;
  setRequestLocale(locale as AppLocale);
  const t = await getTranslations("login");
  const sp = await props.searchParams;
  const next = safeNextPath(typeof sp.next === "string" ? sp.next : null);

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16">
      <h1 className="font-display text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mb-6 mt-1 text-sm text-fg-muted">{t("subtitle")}</p>
      <LoginForm next={next} initialError={sp.error === "callback" ? "callback" : undefined} />
    </div>
  );
}
