"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { catalogHref } from "@/lib/catalog-params";

export function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  const t = useTranslations("search");
  const router = useRouter();

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
        router.push(catalogHref({ q }));
      }}
      className="flex w-full flex-col gap-2 sm:flex-row"
    >
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{t("label")}</span>
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={t("placeholder")}
          className="h-12 w-full rounded-xl border border-line bg-input pl-11 pr-4 text-[15px] text-fg outline-none transition placeholder:text-fg-subtle focus:border-accent focus:ring-3 focus:ring-accent/20"
        />
      </label>
      <button
        type="submit"
        className="h-12 shrink-0 rounded-xl bg-accent px-5 font-medium text-on-accent transition-colors hover:bg-accent-hover active:bg-accent-pressed"
      >
        {t("submit")}
      </button>
    </form>
  );
}
