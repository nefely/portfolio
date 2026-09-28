import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChatThread } from "@/components/chat/ChatThread";
import { Avatar } from "@/components/chat/ConversationList";
import { Link } from "@/i18n/navigation";
import { requireProfile } from "@/lib/auth/dal";
import { getConversation } from "@/lib/chat/queries";
import type { AppLocale } from "@/types/i18n";

export default async function ConversationPage({
  params,
}: PageProps<"/[locale]/account/messages/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale as AppLocale);

  const { user } = await requireProfile(`/account/messages/${id}`);
  const conversation = await getConversation(id, user.id);

  if (!conversation) {
    notFound();
  }

  const t = await getTranslations("chat");
  const { other } = conversation;
  const name = other.name ?? t("unknownUser");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/account/messages"
        className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        ← {t("backToList")}
      </Link>

      <div className="mt-4 mb-6 flex items-center gap-4">
        <Avatar name={other.name} />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight">
            {other.kind === "candidate" && other.profileSlug ? (
              <Link href={`/candidates/${other.profileSlug}`} className="hover:underline">
                {name}
              </Link>
            ) : (
              name
            )}
          </h1>
          {other.kind && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {other.kind === "candidate" ? t("kindCandidate") : t("kindEmployer")}
            </p>
          )}
        </div>
      </div>

      <ChatThread
        conversationId={conversation.id}
        currentUserId={user.id}
        initialMessages={conversation.messages}
      />
    </div>
  );
}
