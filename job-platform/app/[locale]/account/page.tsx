import { getTranslations, setRequestLocale } from "next-intl/server";
import { CandidateProfileForm } from "@/components/account/CandidateProfileForm";
import { EmployerProfileForm } from "@/components/account/EmployerProfileForm";
import { OwnJobsList } from "@/components/account/OwnJobsList";
import { SignOutButton } from "@/components/account/SignOutButton";
import { primaryButtonClassName } from "@/components/shared/formStyles";
import { Link } from "@/i18n/navigation";
import { getOwnCandidateProfile, getOwnEmployerProfile, getOwnJobs } from "@/lib/account/queries";
import { requireProfile } from "@/lib/auth/dal";
import type { CandidateProfileValues } from "@/lib/validation/candidateProfile";
import type { AppLocale } from "@/types/i18n";

export default async function AccountPage({ params }: PageProps<"/[locale]/account">) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);

  const { user, role } = await requireProfile("/account");
  const t = await getTranslations("account");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-block rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-gray-900">
            {role === "seeker" ? t("seekerBadge") : t("employerBadge")}
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{t("title")}</h1>
          {user.email && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("signedInAs", { email: user.email })}
            </p>
          )}
        </div>
        <SignOutButton label={t("signOut")} />
      </div>

      {role === "seeker" ? (
        <section className={cardClassName}>
          <SeekerSection userId={user.id} locale={locale as AppLocale} />
        </section>
      ) : (
        <EmployerSections userId={user.id} />
      )}
    </div>
  );
}

const cardClassName =
  "mt-10 rounded-2xl border border-gray-200 p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-950/70";

async function SeekerSection({ userId, locale }: { userId: string; locale: AppLocale }) {
  const t = await getTranslations("account");
  const profile = await getOwnCandidateProfile(userId);

  // Порожня форма для нового профілю: мова профілю = поточна мова сайту.
  const emptyValues: CandidateProfileValues = {
    name: "",
    headline: "",
    categories: [],
    locationCode: "warsaw",
    desiredEmploymentTypes: [],
    desiredWorkFormats: [],
    experienceLevel: "0-1",
    languages: [],
    skills: "",
    about: "",
    salaryExpectationFrom: "",
    currency: "EUR",
    availableFrom: "",
    profileLocale: locale,
    isPublic: true,
  };

  return (
    <>
      <h2 className="text-xl font-bold tracking-tight">{t("candidateFormTitle")}</h2>
      <p className="mt-1 mb-6 text-gray-600 dark:text-gray-300">{t("candidateFormSubtitle")}</p>
      <CandidateProfileForm
        initialValues={profile?.values ?? emptyValues}
        initialSlug={profile?.slug ?? null}
      />
    </>
  );
}

async function EmployerSections({ userId }: { userId: string }) {
  const t = await getTranslations("account");
  const profile = await getOwnEmployerProfile(userId);
  const jobs = profile ? await getOwnJobs(profile.id) : [];

  return (
    <>
      <section className={cardClassName}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{t("myJobsTitle")}</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-300">{t("myJobsSubtitle")}</p>
          </div>
          {profile && (
            <Link href="/account/jobs/new" className={primaryButtonClassName}>
              + {t("newJob")}
            </Link>
          )}
        </div>
        <div className="mt-6">
          {/* Вакансія публікується від імені компанії — без профілю компанії
              публікувати нема від кого. */}
          {profile ? (
            <OwnJobsList jobs={jobs} />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("errors.companyRequired")}
            </p>
          )}
        </div>
      </section>

      <section className={cardClassName}>
        <h2 className="text-xl font-bold tracking-tight">{t("employerFormTitle")}</h2>
        <p className="mt-1 mb-6 text-gray-600 dark:text-gray-300">{t("employerFormSubtitle")}</p>
        <EmployerProfileForm
          initialValues={
            profile?.values ?? { name: "", locationCode: "warsaw", website: "", about: "" }
          }
          hasProfile={profile !== null}
        />
      </section>
    </>
  );
}
