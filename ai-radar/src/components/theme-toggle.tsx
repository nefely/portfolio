"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const t = useTranslations("header");
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("toggleTheme")}
      title={t(isDark ? "lightTheme" : "darkTheme")}
      // the icon depends on localStorage, which the server can't know
      suppressHydrationWarning
      className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
        className="absolute h-4 w-4 rotate-90 scale-50 opacity-0 transition-all duration-200 dark:rotate-0 dark:scale-100 dark:opacity-100"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="absolute h-4 w-4 transition-all duration-200 dark:-rotate-90 dark:scale-50 dark:opacity-0"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      </svg>
    </button>
  );
}
