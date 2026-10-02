"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "./auth-provider";

export function FavoriteToggle({ domain, variant = "icon" }: { domain: string; variant?: "icon" | "button" }) {
  const t = useTranslations("common");
  const { isFavorite, toggleFavorite, status } = useAuth();
  const active = isFavorite(domain);
  const label = active ? t("inFavorites") : status === "guest" ? t("favoritesNeedLogin") : t("addToFavorites");

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={() => void toggleFavorite(domain)}
        aria-pressed={active}
        title={label}
        className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors ${
          active ? "border-amber/40 bg-amber-subtle text-amber" : "border-line-strong bg-surface-2 text-fg hover:bg-surface-3"
        }`}
      >
        <StarIcon filled={active} />
        {active ? t("inFavorites") : t("addToFavorites")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        void toggleFavorite(domain);
      }}
      title={label}
      aria-label={`${label}: ${domain}`}
      aria-pressed={active}
      className={`relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
        active ? "border-amber/40 bg-amber-subtle text-amber" : "border-line bg-surface-2 text-fg-subtle hover:border-line-strong hover:text-fg"
      }`}
    >
      <StarIcon filled={active} />
    </button>
  );
}

export function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" strokeLinejoin="round" />
    </svg>
  );
}
