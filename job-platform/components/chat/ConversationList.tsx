"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMounted } from "@/hooks/useMounted";
import { Link, useRouter } from "@/i18n/navigation";
import { subscribeToMessages } from "@/lib/chat/realtime";
import type { ConversationSummary } from "@/types/chat";

interface ConversationListProps {
  conversations: ConversationSummary[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  const t = useTranslations("chat");
  const locale = useLocale();
  const mounted = useMounted();
  const router = useRouter();

  // Нове повідомлення в будь-якій з розмов (RLS віддає лише свої) —
  // перечитуємо список на сервері: порядок, прев'ю й лічильники.
  useEffect(() => subscribeToMessages({ onInsert: () => router.refresh() }), [router]);

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
        <p className="font-semibold">{t("emptyTitle")}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("emptyHint")}</p>
      </div>
    );
  }

  const timeFormat = new Intl.DateTimeFormat(locale, { timeStyle: "short" });
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const today = new Date().toDateString();

  return (
    <ul className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-950/70">
      {conversations.map((conversation) => {
        const date = new Date(conversation.lastMessageAt);
        const unread = conversation.unreadCount > 0;
        const preview =
          conversation.lastMessageBody === null
            ? t("noMessagesYet")
            : conversation.lastMessageFromMe
              ? t("youPrefix", { text: conversation.lastMessageBody })
              : conversation.lastMessageBody;

        return (
          <li key={conversation.id}>
            <Link
              href={`/account/messages/${conversation.id}`}
              className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-gray-50 sm:px-6 dark:hover:bg-gray-900"
            >
              <Avatar name={conversation.other.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={`truncate ${unread ? "font-bold" : "font-semibold"}`}>
                    {conversation.other.name ?? t("unknownUser")}
                  </p>
                  <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {mounted &&
                      (date.toDateString() === today
                        ? timeFormat.format(date)
                        : dateFormat.format(date))}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-3">
                  <p
                    className={`truncate text-sm ${
                      unread
                        ? "font-medium text-gray-900 dark:text-gray-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {preview}
                  </p>
                  {unread && (
                    <span className="shrink-0 rounded-full bg-gray-900 px-2 py-0.5 text-xs font-semibold text-white dark:bg-white dark:text-gray-900">
                      <span className="sr-only">{t("unreadLabel")}: </span>
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Avatar({ name }: { name: string | null }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200"
    >
      {(name?.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}
