"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { primaryButtonClassName } from "@/components/shared/formStyles";
import { useRouter } from "@/i18n/navigation";
import { startConversation } from "@/lib/chat/actions";
import type { ChatActionError, ChatTarget } from "@/types/chat";

interface StartChatButtonProps {
  target: ChatTarget;
  label: string;
}

export function StartChatButton({ target, label }: StartChatButtonProps) {
  const t = useTranslations("chat");
  const router = useRouter();
  const [error, setError] = useState<ChatActionError>();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError(undefined);
    startTransition(async () => {
      const result = await startConversation(target);
      if (result.ok) {
        router.push(`/account/messages/${result.id}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={primaryButtonClassName}
      >
        {pending ? t("opening") : label}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {t(`errors.${error}`)}
        </p>
      )}
    </div>
  );
}
