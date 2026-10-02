"use client";

import { useTranslations } from "next-intl";
import { MAX_COMPARE, useCompare } from "@/lib/list-store";

export function CompareToggle({ domain, variant = "icon" }: { domain: string; variant?: "icon" | "button" }) {
  const t = useTranslations("common");
  const compare = useCompare();
  const active = compare.has(domain);
  const disabled = !active && compare.isFull;
  const label = active ? t("inCompare") : disabled ? t("compareMax", { max: MAX_COMPARE }) : t("addToCompare");

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={() => compare.toggle(domain)}
        disabled={disabled}
        aria-pressed={active}
        className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          active
            ? "border-accent-border bg-accent-subtle text-accent-text"
            : "border-line-strong bg-surface-2 text-fg hover:bg-surface-3"
        }`}
      >
        <CompareIcon checked={active} />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        compare.toggle(domain);
      }}
      disabled={disabled}
      title={label}
      aria-label={`${label}: ${domain}`}
      aria-pressed={active}
      className={`relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-accent-border bg-accent-subtle text-accent"
          : "border-line bg-surface-2 text-fg-subtle hover:border-line-strong hover:text-fg"
      }`}
    >
      <CompareIcon checked={active} />
    </button>
  );
}

export function CompareIcon({ checked = false }: { checked?: boolean }) {
  return checked ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  );
}
