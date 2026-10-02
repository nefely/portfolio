"use client";

import { useLocale, useTranslations } from "next-intl";
import NextLink from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { type AppLocale, routing } from "@/i18n/routing";

const LABELS = { uk: "UA", en: "EN" } as const;
const LOCALE_PREFIX = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

function Switcher() {
  const active = useLocale();
  const t = useTranslations("header");
  // Read the real URL and strip whatever locale prefix it has. next-intl's
  // usePathname strips only the *current* context locale, so on a fast double
  // click (context already "en", URL still "/uk/…") it produced "/uk/en/…".
  const rest = usePathname().replace(LOCALE_PREFIX, "") || "/";
  const search = useSearchParams().toString();

  const hrefFor = (locale: AppLocale) => `/${locale}${rest === "/" ? "" : rest}${search ? `?${search}` : ""}`;

  return (
    <div role="group" aria-label={t("language")} className="flex h-8 shrink-0 items-center overflow-hidden rounded-md border border-line text-xs font-medium">
      {routing.locales.map((locale) =>
        locale === active ? (
          <span key={locale} aria-current="true" className="flex h-full items-center bg-accent-subtle px-2 text-accent-text">
            {LABELS[locale]}
          </span>
        ) : (
          <NextLink
            key={locale}
            href={hrefFor(locale)}
            hrefLang={locale}
            // remember the choice for "/" (next-intl reads this cookie)
            onClick={() => {
              document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
            }}
            className="flex h-full items-center px-2 text-fg-subtle transition-colors hover:text-fg"
          >
            {LABELS[locale]}
          </NextLink>
        ),
      )}
    </div>
  );
}

// useSearchParams needs a Suspense boundary on statically rendered pages
export function LocaleSwitcher() {
  return (
    <Suspense fallback={<span className="h-8 w-16.5 shrink-0 rounded-md border border-line" />}>
      <Switcher />
    </Suspense>
  );
}
