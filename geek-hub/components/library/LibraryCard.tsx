"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Heart, Plus, Star } from "lucide-react";
import type { Entry } from "@/types/library";
import { POSTER_SIZES } from "@/components/anime/AnimeCard";
import { ENTRY_STATUS_LABELS, ENTRY_STATUS_STYLES } from "@/lib/anime/labels";
import { applyEntryPatch } from "@/lib/library/entryPatch";
import { useUpsertEntry } from "@/hooks/useEntries";
import { cn } from "@/lib/utils";

export function LibraryCard({ entry }: { entry: Entry }) {
  const upsert = useUpsertEntry();
  const { anime } = entry;
  const total = anime.episodes;
  const percent = total ? Math.round((entry.progress / total) * 100) : 0;
  const canIncrement = entry.status !== "completed" && (total === null || entry.progress < total);

  return (
    <div className="group">
      <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
        <Link href={`/anime/${anime.id}`} aria-label={anime.title} className="absolute inset-0">
          {anime.image && (
            <Image
              src={anime.image}
              alt=""
              fill
              sizes={POSTER_SIZES}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </Link>
        <span
          className={cn(
            "pointer-events-none absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm",
            ENTRY_STATUS_STYLES[entry.status].text,
          )}
        >
          <span className={cn("size-1.5 rounded-full", ENTRY_STATUS_STYLES[entry.status].dot)} />
          {ENTRY_STATUS_LABELS[entry.status]}
        </span>
        {entry.isFavorite && (
          <Heart className="pointer-events-none absolute top-2 right-2 size-4 fill-primary text-primary drop-shadow" />
        )}

        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 to-transparent p-2 pt-8">
          <div className="flex items-center justify-between gap-2 text-xs text-white">
            <span className="tabular-nums">
              {entry.progress}/{total ?? "?"} ep
            </span>
            {entry.score !== null && (
              <span className="flex items-center gap-0.5">
                <Star className="size-3 fill-amber-400 text-amber-400" /> {entry.score}
              </span>
            )}
            {canIncrement && (
              <button
                type="button"
                onClick={() =>
                  upsert.mutate(applyEntryPatch(anime, entry, { progress: entry.progress + 1 }))
                }
                className="grid size-6 place-items-center rounded-md bg-white/15 backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label={`Mark episode ${entry.progress + 1} of ${anime.title} as watched`}
              >
                {total !== null && entry.progress + 1 === total ? (
                  <Check className="size-3.5" />
                ) : (
                  <Plus className="size-3.5" />
                )}
              </button>
            )}
          </div>
          {total !== null && (
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${percent}%` }}
              />
            </div>
          )}
        </div>
      </div>
      <Link
        href={`/anime/${anime.id}`}
        className="mt-2 line-clamp-2 block text-sm leading-snug font-medium hover:text-primary"
      >
        {anime.title}
      </Link>
    </div>
  );
}
