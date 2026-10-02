"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS = { uk: "UA", en: "EN" } as const;

function Switcher() {
  const active = useLocale();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const t = useTranslations("header");

  return (
    <div role="group" aria-label={t("language")} className="flex h-8 shrink-0 items-center overflow-hidden rounded-md border border-line text-xs font-medium">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          // keep the query string (filters) when switching language
          href={search ? `${pathname}?${search}` : pathname}
          locale={locale}
          aria-current={locale === active ? "true" : undefined}
          className={`flex h-full items-center px-2 transition-colors ${
            locale === active ? "bg-accent-subtle text-accent-text" : "text-fg-subtle hover:text-fg"
          }`}
        >
          {LABELS[locale]}
        </Link>
      ))}
    </div>
  );
}

// useSearchParams needs a Suspense boundary on statically rendered pages
export function LocaleSwitcher() {
  return (
    <Suspense fallback={<span className="h-8 w-[66px] shrink-0 rounded-md border border-line" />}>
      <Switcher />
    </Suspense>
  );
}
