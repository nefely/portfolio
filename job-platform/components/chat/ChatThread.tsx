"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { inputClassName, primaryButtonClassName } from "@/components/shared/formStyles";
import { useMounted } from "@/hooks/useMounted";
import { markConversationRead, sendMessage } from "@/lib/chat/actions";
import { MESSAGE_COLUMNS, mapMessageRow, type MessageRow } from "@/lib/chat/mapMessageRow";
import { subscribeToMessages } from "@/lib/chat/realtime";
import { createClient } from "@/lib/supabase/client";
import { MESSAGE_MAX_LENGTH, validateMessageBody } from "@/lib/validation/message";
import type { ChatMessage } from "@/types/chat";

interface ChatThreadProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
}

// Ще не підтверджене сервером повідомлення (оптимістичний показ).
interface OutgoingMessage {
  tempId: string;
  body: string;
  status: "sending" | "failed";
}

function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const known = new Set(current.map((message) => message.id));
  const fresh = incoming.filter((message) => !known.has(message.id));
  if (fresh.length === 0) return current;
  return [...current, ...fresh].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function ChatThread({ conversationId, currentUserId, initialMessages }: ChatThreadProps) {
  const t = useTranslations("chat");
  const locale = useLocale();
  const mounted = useMounted();

  const [messages, setMessages] = useState(initialMessages);
  const [outgoing, setOutgoing] = useState<OutgoingMessage[]>([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  // Для catchUp() всередині підписки — щоб не перепідписуватися на кожне
  // нове повідомлення.
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const addMessages = useCallback((incoming: ChatMessage[]) => {
    setMessages((current) => mergeMessages(current, incoming));
  }, []);

  const markReadIfVisible = useCallback(() => {
    if (document.visibilityState === "visible") void markConversationRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    markReadIfVisible();
    document.addEventListener("visibilitychange", markReadIfVisible);
    return () => document.removeEventListener("visibilitychange", markReadIfVisible);
  }, [markReadIfVisible]);

  useEffect(() => {
    // Повідомлення між серверним рендером і підпискою (або під час обриву
    // WebSocket) Realtime не повторить — дотягуємо їх звичайним запитом.
    async function catchUp() {
      const last = messagesRef.current.at(-1);
      let query = createClient()
        .from("job_platform_messages")
        .select(MESSAGE_COLUMNS)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (last) query = query.gt("created_at", last.createdAt);

      const { data } = await query;
      if (data && data.length > 0) {
        addMessages((data as MessageRow[]).map(mapMessageRow));
        markReadIfVisible();
      }
    }

    return subscribeToMessages({
      conversationId,
      onInsert: (message) => {
        addMessages([message]);
        if (message.senderId !== currentUserId) markReadIfVisible();
      },
      onSubscribed: () => void catchUp(),
    });
  }, [conversationId, currentUserId, addMessages, markReadIfVisible]);

  // Нове повідомлення (своє чи чуже) — прокручуємо вниз.
  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages.length, outgoing.length]);

  function deliver(tempId: string, body: string) {
    setOutgoing((current) => [
      ...current.filter((item) => item.tempId !== tempId),
      { tempId, body, status: "sending" },
    ]);

    const markFailed = () =>
      setOutgoing((current) =>
        current.map((item) => (item.tempId === tempId ? { ...item, status: "failed" } : item)),
      );

    sendMessage(conversationId, body)
      .then((result) => {
        if (!result.ok) return markFailed();
        addMessages([result.message]);
        setOutgoing((current) => current.filter((item) => item.tempId !== tempId));
      })
      .catch(markFailed);
  }

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    if (validateMessageBody(draft)) return;
    deliver(crypto.randomUUID(), draft);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter — надіслати, Shift+Enter — новий рядок. isComposing — щоб не
    // надсилати посеред набору через IME.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      handleSubmit();
    }
  }

  const timeFormat = new Intl.DateTimeFormat(locale, { timeStyle: "short" });
  const dayFormat = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
  const canSend = validateMessageBody(draft) === undefined;

  return (
    <div className="flex h-[70vh] min-h-96 flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950/70">
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label={t("threadLabel")}
        className="flex flex-1 flex-col gap-2 overflow-y-auto p-4 sm:p-6"
      >
        {messages.length === 0 && outgoing.length === 0 && (
          <p className="m-auto text-center text-sm text-gray-500 dark:text-gray-400">
            {t("threadEmpty")}
          </p>
        )}

        {messages.map((message, index) => {
          const mine = message.senderId === currentUserId;
          const date = new Date(message.createdAt);
          const previous = messages[index - 1];
          // Дата/час залежать від часового поясу браузера — показуємо лише
          // після гідратації, щоб не розійтися з серверним рендером.
          const showDay =
            mounted &&
            (!previous || new Date(previous.createdAt).toDateString() !== date.toDateString());

          return (
            <div key={message.id} className="flex flex-col">
              {showDay && (
                <p className="my-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                  {dayFormat.format(date)}
                </p>
              )}
              <MessageBubble mine={mine} body={message.body}>
                {mounted ? timeFormat.format(date) : null}
              </MessageBubble>
            </div>
          );
        })}

        {outgoing.map((item) => (
          <div key={item.tempId} className="flex flex-col">
            <MessageBubble mine body={item.body} dimmed={item.status === "sending"}>
              {item.status === "sending" ? (
                t("sending")
              ) : (
                <span className="text-red-300 dark:text-red-600">
                  {t("notSent")}{" "}
                  <button
                    type="button"
                    onClick={() => deliver(item.tempId, item.body)}
                    className="font-semibold underline underline-offset-2"
                  >
                    {t("retry")}
                  </button>
                </span>
              )}
            </MessageBubble>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-3 border-t border-gray-200 p-3 sm:p-4 dark:border-gray-800"
      >
        <label htmlFor="chat-input" className="sr-only">
          {t("inputLabel")}
        </label>
        <textarea
          id="chat-input"
          rows={1}
          value={draft}
          maxLength={MESSAGE_MAX_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("inputPlaceholder")}
          className={`${inputClassName} field-sizing-content max-h-40 min-h-11 resize-none`}
        />
        <button type="submit" disabled={!canSend} className={`${primaryButtonClassName} shrink-0`}>
          {t("send")}
        </button>
      </form>
    </div>
  );
}

interface MessageBubbleProps {
  mine: boolean;
  body: string;
  dimmed?: boolean;
  children: ReactNode;
}

function MessageBubble({ mine, body, dimmed, children }: MessageBubbleProps) {
  return (
    <div
      className={`max-w-[85%] rounded-2xl px-4 py-2 sm:max-w-[70%] ${
        mine
          ? "self-end rounded-br-sm bg-gray-900 text-white dark:bg-white dark:text-gray-900"
          : "self-start rounded-bl-sm bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100"
      } ${dimmed ? "opacity-60" : ""}`}
    >
      <p className="text-sm wrap-break-word whitespace-pre-wrap">{body}</p>
      <p
        className={`mt-1 min-h-4 text-right text-[11px] ${
          mine ? "text-gray-300 dark:text-gray-500" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {children}
      </p>
    </div>
  );
}
