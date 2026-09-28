import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChatCta } from "@/components/chat/ChatCta";
import { ContactForm } from "@/components/contact/ContactForm";
import { CandidateDetailView } from "@/components/candidates/CandidateDetailView";
import { resolveCandidateBySlug } from "@/lib/candidates/resolveCandidateBySlug";
import type { AppLocale } from "@/types/i18n";

export default async function CandidateDetailPage({
  params,
}: PageProps<"/[locale]/candidates/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale as AppLocale);

  const candidate = await resolveCandidateBySlug(slug);

  if (!candidate) {
    notFound();
  }

  const t = await getTranslations("candidates");
  const tChat = await getTranslations("chat");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <CandidateDetailView candidate={candidate} />

      {/* Профіль з акаунтом — пишемо людині напряму в чат; seed-профіль
          каталогу (без акаунта) — лишається загальна форма заявки. */}
      {candidate.userId ? (
        <ChatCta
          target={{ kind: "candidate", slug: candidate.slug }}
          targetUserId={candidate.userId}
          title={tChat("ctaCandidateTitle")}
          subtitle={tChat("ctaCandidateSubtitle")}
          buttonLabel={tChat("ctaCandidateButton")}
          returnPath={`/candidates/${candidate.slug}`}
        />
      ) : (
        <div className="mt-10 border-t border-gray-200 pt-8 dark:border-gray-800">
          <h2 className="text-xl font-bold tracking-tight">{t("contactTitle")}</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-300">{t("contactSubtitle")}</p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      )}
    </div>
  );
}
