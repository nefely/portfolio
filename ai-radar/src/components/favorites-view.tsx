"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Site } from "@/lib/freeserp";
import { useAuth } from "./auth-provider";
import { FavoriteToggle, StarIcon } from "./favorite-toggle";
import { SiteCard } from "./site-card";
import { SiteCardSkeleton } from "./skeleton";

const CHUNK = 24; // matches MAX_DOMAINS in /api/sites

type Profiles = Record<string, Site | null>;

async function fetchProfiles(domains: string[]): Promise<Profiles> {
  const chunks: string[][] = [];
  for (let i = 0; i < domains.length; i += CHUNK) chunks.push(domains.slice(i, i + CHUNK));
  const responses = await Promise.all(
    chunks.map(async (chunk) => {
      const res = await fetch(`/api/sites?domains=${chunk.map(encodeURIComponent).join(",")}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as { results: { domain: string; site: Site | null }[] };
    }),
  );
  return Object.fromEntries(responses.flatMap((r) => r.results.map((x) => [x.domain, x.site])));
}

export function FavoritesView() {
  const t = useTranslations("favorites");
  const { status, favorites, favoritesError } = useAuth();
  const [profiles, setProfiles] = useState<Profiles>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  // only fetch domains we don't have yet (removing a favorite needs no request)
  const missing = useMemo(() => favorites.filter((d) => !(d in profiles)), [favorites, profiles]);

  useEffect(() => {
    if (missing.length === 0) return;
    let cancelled = false;
    fetchProfiles(missing)
      .then((p) => !cancelled && setProfiles((prev) => ({ ...prev, ...p })))
      .catch((e: Error) => !cancelled && setLoadError(e.message));
    return () => {
      cancelled = true;
    };
  }, [missing]);

  if (status === "loading") return <GridSkeleton />;

  if (status === "guest") {
    return (
      <div className="rounded-xl border border-line bg-surface-1 p-8 text-center sm:p-10">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-subtle text-amber">
          <StarIcon filled />
        </span>
        <p className="mt-4 font-display text-lg font-semibold">{t("guestTitle")}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">{t("guestText")}</p>
        <Link
          href="/login?next=/favorites"
          className="mt-5 inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-medium text-on-accent hover:bg-accent-hover"
        >
          {t("guestButton")}
        </Link>
      </div>
    );
  }

  const error = favoritesError ?? loadError;

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {t("error", { message: error })}
        </p>
      )}
      {favorites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface-1 p-8 text-center sm:p-10">
          <p className="font-display text-lg font-semibold">{t("emptyTitle")}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">{t("emptyText")}</p>
          <Link href="/catalog" className="mt-4 inline-block text-sm text-accent-text hover:underline">
            {t("toCatalog")}
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-fg-muted">{t("count", { count: favorites.length })}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((domain) => {
              if (!(domain in profiles)) return <SiteCardSkeleton key={domain} />;
              const site = profiles[domain];
              return site ? (
                <SiteCard key={domain} site={site} />
              ) : (
                <div key={domain} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-surface-1 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-display font-semibold">{domain}</p>
                    <p className="mt-1 text-xs text-fg-subtle">{t("missing")}</p>
                  </div>
                  <FavoriteToggle domain={domain} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <SiteCardSkeleton key={i} />
      ))}
    </div>
  );
}
