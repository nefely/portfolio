import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { JobPostingForm } from "@/components/account/JobPostingForm";
import { getOwnEmployerProfile } from "@/lib/account/queries";
import { requireProfile } from "@/lib/auth/dal";
import type { JobPostingValues } from "@/lib/validation/jobPosting";
import type { AppLocale } from "@/types/i18n";

export default async function NewJobPage({ params }: PageProps<"/[locale]/account/jobs/new">) {
  const locale = (await params).locale as AppLocale;
  setRequestLocale(locale);

  const { user, role } = await requireProfile("/account/jobs/new");
  const employer = role === "employer" ? await getOwnEmployerProfile(user.id) : null;
  // Шукач роботи або роботодавець без збереженої компанії — у кабінет, там
  // видно, чого бракує.
  if (!employer) {
    redirect({ href: "/account", locale });
  }

  const t = await getTranslations("account");

  // Місто за замовчуванням — місто компанії, найчастіший випадок.
  const initialValues: JobPostingValues = {
    title: "",
    description: "",
    category: "other",
    locationCode: employer!.values.locationCode,
    employmentType: "full-time",
    workFormat: "onsite",
    experienceLevel: "0-1",
    requiredLanguages: [],
    salaryFrom: "",
    salaryTo: "",
    currency: "EUR",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{t("newJobTitle")}</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        {t("jobFormSubtitle", { company: employer!.values.name })}
      </p>
      <section className="mt-8 rounded-2xl border border-gray-200 p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-950/70">
        <JobPostingForm initialValues={initialValues} />
      </section>
    </div>
  );
}
