"use client";

import { useTranslations } from "next-intl";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errors");
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold">{t("title")}</h1>
      <p className="mt-2 text-fg-muted">{t("text")}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-medium text-on-accent hover:bg-accent-hover"
      >
        {t("retry")}
      </button>
    </div>
  );
}
