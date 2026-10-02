"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { normalizeDomain } from "@/lib/freeserp";
import { MAX_COMPARE, useCompare } from "@/lib/list-store";

const hrefFor = (domains: string[]) => (domains.length ? `/compare?d=${domains.map(encodeURIComponent).join(",")}` : "/compare");

/**
 * Keeps the URL (?d=…) and the local compare selection in sync:
 * a shared link wins over local state; an empty URL restores the local selection.
 */
export function CompareSync({ urlDomains }: { urlDomains: string[] }) {
  const compare = useCompare();
  const router = useRouter();
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;
    if (urlDomains.length > 0) compare.set(urlDomains);
    else if (compare.items.length > 0) router.replace(hrefFor(compare.items));
  }, [urlDomains, compare, router]);

  return null;
}

export function CompareAddForm({ urlDomains }: { urlDomains: string[] }) {
  const t = useTranslations("compare");
  const compare = useCompare();
  const router = useRouter();
  const full = urlDomains.length >= MAX_COMPARE;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("domain") as HTMLInputElement;
        const d = normalizeDomain(input.value);
        if (!d || urlDomains.includes(d) || full) return;
        const next = [...urlDomains, d];
        compare.set(next);
        input.value = "";
        router.push(hrefFor(next));
      }}
      className="flex w-full max-w-md gap-2"
    >
      <input
        name="domain"
        placeholder={t("addPlaceholder")}
        disabled={full}
        aria-label={t("addPlaceholder")}
        className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-input px-3 text-sm text-fg outline-none transition placeholder:text-fg-subtle focus:border-accent focus:ring-3 focus:ring-accent/20 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={full}
        className="h-10 shrink-0 rounded-lg bg-accent px-4 text-sm font-medium text-on-accent hover:bg-accent-hover disabled:opacity-50"
      >
        {t("add")}
      </button>
    </form>
  );
}

export function CompareRemoveButton({ domain, urlDomains }: { domain: string; urlDomains: string[] }) {
  const t = useTranslations("compare");
  const compare = useCompare();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        const next = urlDomains.filter((d) => d !== domain);
        compare.set(next);
        router.push(hrefFor(next));
      }}
      className="text-xs text-fg-subtle hover:text-danger"
    >
      {t("remove")} ×
    </button>
  );
}

export function CompareClearButton() {
  const t = useTranslations("compare");
  const compare = useCompare();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        compare.clear();
        router.push("/compare");
      }}
      className="h-10 rounded-lg border border-line px-3 text-sm text-fg-muted hover:bg-surface-2 hover:text-fg"
    >
      {t("clear")}
    </button>
  );
}
