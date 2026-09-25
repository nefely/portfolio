"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { errorBannerClassName, primaryButtonClassName } from "@/components/shared/formStyles";
import type { AccountFormError } from "@/types/account";

interface SaveBarProps {
  pending: boolean;
  saved: boolean;
  formError?: AccountFormError;
  /** Напр. "Опублікувати" для нової вакансії; за замовчуванням — "Зберегти". */
  submitLabel?: string;
  pendingLabel?: string;
  /** Додаткові дії поруч із кнопкою (напр. "Скасувати"). */
  children?: ReactNode;
}

// Кнопка submit + статус останнього збереження — спільні для форм кабінету.
export function SaveBar({
  pending,
  saved,
  formError,
  submitLabel,
  pendingLabel,
  children,
}: SaveBarProps) {
  const t = useTranslations("account");

  return (
    <div className="flex flex-col gap-3">
      {formError && (
        <p role="alert" className={errorBannerClassName}>
          {t(`errors.${formError}`)}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={primaryButtonClassName}>
          {pending ? (pendingLabel ?? t("saving")) : (submitLabel ?? t("save"))}
        </button>
        {children}
        <span
          role="status"
          aria-live="polite"
          className="text-sm text-green-700 dark:text-green-400"
        >
          {saved && !pending ? `✓ ${t("saved")}` : ""}
        </span>
      </div>
    </div>
  );
}
