import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChatCta } from "@/components/chat/ChatCta";
import { ContactForm } from "@/components/contact/ContactForm";
import { JobDetailView } from "@/components/partners/JobDetailView";
import { resolveJobById } from "@/lib/jobs/resolveJobById";
import type { AppLocale } from "@/types/i18n";

export default async function JobDetailPage({ params }: PageProps<"/[locale]/jobs/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale as AppLocale);

  const job = await resolveJobById(id);

  if (!job) {
    notFound();
  }

  const t = await getTranslations("jobs");
  const tChat = await getTranslations("chat");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JobDetailView job={job} />

      {/* Вакансія компанії з акаунтом — чат із роботодавцем; партнерська чи
          seed-вакансія — загальна форма заявки. */}
      {job.employerUserId ? (
        <ChatCta
          target={{ kind: "job", id: job.id }}
          targetUserId={job.employerUserId}
          title={tChat("ctaEmployerTitle")}
          subtitle={tChat("ctaEmployerSubtitle")}
          buttonLabel={tChat("ctaEmployerButton")}
          returnPath={`/jobs/${job.id}`}
        />
      ) : (
        <div className="mt-10 border-t border-gray-200 pt-8 dark:border-gray-800">
          <h2 className="text-xl font-bold tracking-tight">{t("applyTitle")}</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-300">{t("applySubtitle")}</p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      )}
    </div>
  );
}
