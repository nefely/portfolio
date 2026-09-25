import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { JobPostingForm } from "@/components/account/JobPostingForm";
import { getOwnEmployerProfile, getOwnJob } from "@/lib/account/queries";
import { requireProfile } from "@/lib/auth/dal";
import type { AppLocale } from "@/types/i18n";

export default async function EditJobPage({
  params,
}: PageProps<"/[locale]/account/jobs/[id]/edit">) {
  const { locale: rawLocale, id } = await params;
  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const { user, role } = await requireProfile(`/account/jobs/${id}/edit`);
  const employer = role === "employer" ? await getOwnEmployerProfile(user.id) : null;
  if (!employer) {
    redirect({ href: "/account", locale });
  }

  // Чужа або неіснуюча вакансія — 404, а не форма (getOwnJob фільтрує по
  // employer_id поточного користувача).
  const values = await getOwnJob(id, employer!.id, locale);
  if (!values) {
    notFound();
  }

  const t = await getTranslations("account");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{t("editJobTitle")}</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        {t("jobFormSubtitle", { company: employer!.values.name })}
      </p>
      <section className="mt-8 rounded-2xl border border-gray-200 p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-950/70">
        <JobPostingForm initialValues={values} jobId={id} />
      </section>
    </div>
  );
}
