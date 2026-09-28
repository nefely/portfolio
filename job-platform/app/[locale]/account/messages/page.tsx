import { getTranslations, setRequestLocale } from "next-intl/server";
import { ConversationList } from "@/components/chat/ConversationList";
import { Link } from "@/i18n/navigation";
import { requireProfile } from "@/lib/auth/dal";
import { getConversations } from "@/lib/chat/queries";
import type { AppLocale } from "@/types/i18n";

export default async function MessagesPage({ params }: PageProps<"/[locale]/account/messages">) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);

  const { user } = await requireProfile("/account/messages");
  const t = await getTranslations("chat");
  const conversations = await getConversations(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/account"
        className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        ← {t("backToAccount")}
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 mb-8 text-gray-600 dark:text-gray-300">{t("subtitle")}</p>
      <ConversationList conversations={conversations} />
    </div>
  );
}
