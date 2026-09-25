import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeNextPath } from "@/lib/auth/safeNextPath";
import type { AppLocale } from "@/types/i18n";

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);

  const query = await searchParams;
  const next = safeNextPath(query.next, "") || undefined;
  // Єдина помилка, що приходить через URL, — невдалий callback (Google /
  // посилання з листа). Довільний ?error= не показуємо.
  const initialError = query.error === "callbackFailed" ? "callbackFailed" : undefined;

  const t = await getTranslations("auth");

  return (
    <AuthPageShell
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link href="/signup" className="font-semibold underline underline-offset-4">
            {t("signupLink")}
          </Link>
        </>
      }
    >
      <LoginForm next={next} initialError={initialError} />
    </AuthPageShell>
  );
}
