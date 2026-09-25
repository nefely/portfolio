import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ChooseRoleForm } from "@/components/auth/ChooseRoleForm";
import { getAccountRole, requireUser } from "@/lib/auth/dal";
import type { AppLocale } from "@/types/i18n";

// Для акаунтів без рядка в job_platform_profiles: вхід через Google без
// реєстрації або акаунт, створений в іншому проєкті спільного Supabase.
export default async function ChooseRolePage({ params }: PageProps<"/[locale]/account/role">) {
  const locale = (await params).locale as AppLocale;
  setRequestLocale(locale);

  const user = await requireUser("/account/role");
  // Роль уже є — змінити її не можна, тож і сторінка вибору не потрібна.
  if (await getAccountRole(user.id)) {
    redirect({ href: "/account", locale });
  }

  const t = await getTranslations("auth");

  return (
    <AuthPageShell title={t("chooseRoleTitle")} subtitle={t("chooseRoleSubtitle")}>
      <ChooseRoleForm />
    </AuthPageShell>
  );
}
