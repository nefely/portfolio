"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import type { Suggestion } from "@/app/api/suggest/route";
import { useRouter } from "@/i18n/navigation";
import { useCompare } from "@/lib/list-store";
import { MAX_COMPARE } from "@/lib/taxonomy";
import { DrBadge } from "./badges";
import { Favicon } from "./favicon";

// Autocomplete for /compare: only sites that exist in FreeSerp can be added.
// ARIA combobox pattern — ↑/↓ move, Enter picks, Esc closes.

const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;
const hrefFor = (domains: string[]) => (domains.length ? `/compare?d=${domains.map(encodeURIComponent).join(",")}` : "/compare");

type Status = "idle" | "loading" | "ready" | "error";

export function CompareSearch({ urlDomains }: { urlDomains: string[] }) {
  const t = useTranslations("compare");
  const compare = useCompare();
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);

  const full = urlDomains.length >= MAX_COMPARE;
  const trimmed = query.trim();

  // debounced fetch; the previous request is aborted when the query changes
  useEffect(() => {
    if (trimmed.length < MIN_CHARS) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(trimmed)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { results: Suggestion[] };
        setResults(data.results ?? []);
        setActive(-1);
        setStatus(res.ok ? "ready" : "error");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setStatus("error");
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [trimmed]);

  function pick(s: Suggestion) {
    if (full || urlDomains.includes(s.domain)) return;
    const next = [...urlDomains, s.domain];
    compare.set(next);
    setQuery("");
    setResults([]);
    setStatus("idle");
    setOpen(false);
    router.push(hrefFor(next));
    inputRef.current?.focus();
  }

  const selectable = (i: number) => results[i] && !urlDomains.includes(results[i].domain);

  function move(delta: number) {
    if (!results.length) return;
    let i = active;
    for (let step = 0; step < results.length; step++) {
      i = (i + delta + results.length) % results.length;
      if (selectable(i)) return setActive(i);
    }
  }

  const showList = open && trimmed.length >= MIN_CHARS && !full;
  const activeId = active >= 0 ? `${listId}-opt-${active}` : undefined;

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
          width="16"
          height="16"
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
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-label={t("addPlaceholder")}
          placeholder={full ? t("full", { max: MAX_COMPARE }) : t("addPlaceholder")}
          disabled={full}
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (e.target.value.trim().length < MIN_CHARS) {
              setResults([]);
              setStatus("idle");
            }
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              move(1);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              move(-1);
            } else if (e.key === "Enter") {
              e.preventDefault();
              // Enter picks the highlighted option, or the first available one
              const i = active >= 0 ? active : results.findIndex((r) => !urlDomains.includes(r.domain));
              if (i >= 0 && selectable(i)) pick(results[i]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          className="h-10 w-full rounded-lg border border-line bg-input pl-9 pr-9 text-sm text-fg outline-none transition placeholder:text-fg-subtle focus:border-accent focus:ring-3 focus:ring-accent/20 disabled:opacity-50"
        />
        {status === "loading" && (
          <span
            aria-hidden="true"
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-line-strong border-t-accent"
          />
        )}
      </div>

      {showList && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-line-strong bg-surface-1 shadow-2xl shadow-black/30">
          <ul id={listId} role="listbox" aria-label={t("addPlaceholder")} className="max-h-80 overflow-y-auto py-1">
            {results.map((s, i) => {
              const added = urlDomains.includes(s.domain);
              return (
                <li
                  key={s.domain}
                  id={`${listId}-opt-${i}`}
                  role="option"
                  aria-selected={i === active}
                  aria-disabled={added}
                  // mousedown (not click) so the input's blur doesn't close the list first
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!added) pick(s);
                  }}
                  onMouseEnter={() => !added && setActive(i)}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${
                    added ? "cursor-not-allowed opacity-50" : i === active ? "bg-surface-2" : ""
                  }`}
                >
                  <Favicon domain={s.domain} size={28} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">{s.domain}</p>
                    <p className="truncate text-xs text-fg-subtle">{s.title ?? "—"}</p>
                  </div>
                  {added ? <span className="shrink-0 text-[11px] text-fg-subtle">{t("alreadyAdded")}</span> : <DrBadge dr={s.dr} />}
                </li>
              );
            })}
          </ul>
          {status !== "loading" && results.length === 0 && (
            <p className="px-3 py-3 text-sm text-fg-muted">{status === "error" ? t("searchError") : t("noMatches")}</p>
          )}
          {status === "loading" && results.length === 0 && <p className="px-3 py-3 text-sm text-fg-subtle">{t("searching")}</p>}
        </div>
      )}
    </div>
  );
}
