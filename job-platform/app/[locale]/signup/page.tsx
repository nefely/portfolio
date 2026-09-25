import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { SignupForm } from "@/components/auth/SignupForm";
import { isAccountRole } from "@/lib/auth/roles";
import type { AppLocale } from "@/types/i18n";

export default async function SignupPage({ params, searchParams }: PageProps<"/[locale]/signup">) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);

  const { role } = await searchParams;
  const t = await getTranslations("auth");

  return (
    <AuthPageShell
      title={t("signupTitle")}
      subtitle={t("signupSubtitle")}
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-semibold underline underline-offset-4">
            {t("loginLink")}
          </Link>
        </>
      }
    >
      <SignupForm initialRole={isAccountRole(role) ? role : null} />
    </AuthPageShell>
  );
}
