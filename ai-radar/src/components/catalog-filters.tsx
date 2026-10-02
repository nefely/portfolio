"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { type CatalogFilters as Filters, catalogHref } from "@/lib/catalog-params";
import type { SortField } from "@/lib/freeserp";
import { BUILDERS, DR_PRESETS, SORT_KEYS, categoryOptions } from "@/lib/taxonomy";

const fieldCls =
  "h-10 w-full min-w-0 rounded-lg border border-line bg-input px-3 text-sm text-fg outline-none transition placeholder:text-fg-subtle focus:border-accent focus:ring-3 focus:ring-accent/20";

export function CatalogFilters({ filters }: { filters: Filters }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount = [filters.q, filters.category, filters.builder, filters.dr, filters.from, filters.to].filter(Boolean).length;

  function apply() {
    const fd = new FormData(formRef.current!);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const href = catalogHref({
      q: get("q"),
      category: get("category"),
      builder: get("builder"),
      dr: get("dr"),
      from: get("from"),
      to: get("to"),
      sort: (get("sort") || undefined) as SortField | undefined,
      page: 1,
    });
    startTransition(() => router.push(href, { scroll: false }));
  }

  return (
    <div>
      {/* mobile: filters collapse behind a toggle so results are visible first */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        aria-controls="catalog-filters"
        className="flex h-11 w-full items-center justify-between rounded-xl border border-line bg-surface-1 px-4 text-sm font-medium lg:hidden"
      >
        <span className="flex items-center gap-2">
          <FilterIcon />
          {mobileOpen ? t("catalog.hideFilters") : t("catalog.showFilters")}
          {activeCount > 0 && (
            <span className="rounded-full bg-accent px-1.5 text-xs font-semibold text-on-accent">{activeCount}</span>
          )}
        </span>
        <span aria-hidden="true" className={`transition-transform ${mobileOpen ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      <form
        id="catalog-filters"
        ref={formRef}
        // key resets uncontrolled inputs when the URL changes (chip click, "reset")
        key={catalogHref(filters)}
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
        onChange={(e) => {
          // text search applies on Enter / button; everything else applies immediately
          if (!(e.target instanceof HTMLInputElement && e.target.name === "q")) apply();
        }}
        className={`${mobileOpen ? "flex" : "hidden"} mt-3 flex-col gap-4 rounded-xl border border-line bg-surface-1 p-4 lg:mt-0 lg:flex`}
        aria-busy={pending}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold">{t("filters.title")}</h2>
          {pending && <span className="text-xs text-accent-text">{t("filters.updating")}</span>}
        </div>

        <Field label={t("filters.search")} htmlFor="f-q">
          <input id="f-q" name="q" type="search" defaultValue={filters.q} placeholder={t("filters.searchPlaceholder")} className={fieldCls} />
        </Field>

        <Field label={t("filters.niche")} htmlFor="f-category">
          <select id="f-category" name="category" defaultValue={filters.category} className={`select ${fieldCls}`}>
            <option value="">{t("filters.allNiches")}</option>
            {categoryOptions(locale).map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("filters.builder")} hint={t("filters.builderHint")} htmlFor="f-builder">
          <select id="f-builder" name="builder" defaultValue={filters.builder} className={`select ${fieldCls}`}>
            <option value="">{t("filters.anyBuilder")}</option>
            {BUILDERS.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label ?? t("builders.aiLikely")}
              </option>
            ))}
          </select>
        </Field>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-xs font-medium text-fg-muted" title={t("filters.drHint")}>
            {t("filters.drMin")}
          </legend>
          <div className="grid grid-cols-5 gap-1">
            {DR_PRESETS.map((p) => (
              <label key={p} className="cursor-pointer">
                <input type="radio" name="dr" value={p} defaultChecked={filters.dr === p} className="peer sr-only" />
                <span className="flex h-9 items-center justify-center rounded-md border border-line bg-surface-2 text-xs text-fg-muted transition-colors hover:text-fg peer-checked:border-accent-border peer-checked:bg-accent-subtle peer-checked:text-accent-text peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                  {p ? `${p}+` : t("filters.drAll")}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-xs font-medium text-fg-muted" title={t("filters.discoveredHint")}>
            {t("filters.discovered")}
          </legend>
          {/* side by side on phones, stacked in the narrow desktop sidebar so the native date UI isn't clipped */}
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            <DateField name="from" defaultValue={filters.from} placeholder={t("filters.dateFrom")} />
            <DateField name="to" defaultValue={filters.to} placeholder={t("filters.dateTo")} />
          </div>
        </fieldset>

        <Field label={t("filters.sort")} htmlFor="f-sort">
          <select id="f-sort" name="sort" defaultValue={filters.sort} className={`select ${fieldCls}`}>
            {SORT_KEYS.map((s) => (
              <option key={s} value={s}>
                {t(`sort.${s}`)}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex gap-2">
          <button
            type="submit"
            className="h-10 flex-1 rounded-lg bg-accent text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
          >
            {t("filters.apply")}
          </button>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => startTransition(() => router.push("/catalog", { scroll: false }))}
              className="h-10 rounded-lg border border-line px-3 text-sm text-fg-muted hover:bg-surface-2 hover:text-fg"
            >
              {t("filters.reset")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-fg-muted" title={hint}>
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * Native date input with a readable placeholder: browsers render an empty
 * <input type="date"> as a cryptic mask ("dd-----yyyy"), so while it's empty
 * we hide that mask and show our own label; any click opens the picker.
 */
function DateField({ name, defaultValue, placeholder }: { name: string; defaultValue: string; placeholder: string }) {
  const [value, setValue] = useState(defaultValue);
  const empty = !value;
  return (
    <div className="relative min-w-0">
      <input
        name={name}
        type="date"
        value={value}
        aria-label={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onClick={(e) => {
          try {
            e.currentTarget.showPicker();
          } catch {
            // showPicker unsupported or blocked — the native control still works
          }
        }}
        className={`${fieldCls} peer cursor-pointer ${empty ? "date-empty" : ""}`}
      />
      {empty && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center gap-2 text-sm text-fg-subtle peer-focus:hidden">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
          </svg>
          {placeholder}
        </span>
      )}
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}
