"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Heart, Minus, Plus, Trash2 } from "lucide-react";
import type { AnimeCard } from "@/types/anime";
import { ENTRY_STATUSES, type EntryStatus } from "@/types/library";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ENTRY_STATUS_LABELS, ENTRY_STATUS_STYLES } from "@/lib/anime/labels";
import { applyEntryPatch } from "@/lib/library/entryPatch";
import { useDeleteEntry, useEntry, useUpsertEntry } from "@/hooks/useEntries";
import { useSessionUser } from "@/hooks/useSessionUser";
import { cn } from "@/lib/utils";
import { ScoreSelect } from "./ScoreSelect";

export function EntryEditor({ anime }: { anime: AnimeCard }) {
  const { user, isPending } = useSessionUser();
  const pathname = usePathname();

  if (isPending) return <Skeleton className="h-9 w-40" />;
  if (!user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className={buttonVariants({ size: "lg" })}
      >
        <Plus /> Add to library
      </Link>
    );
  }
  return <SignedInEditor anime={anime} />;
}

function SignedInEditor({ anime }: { anime: AnimeCard }) {
  const entry = useEntry(anime.id);
  const upsert = useUpsertEntry();
  const remove = useDeleteEntry();

  const save = (patch: Parameters<typeof applyEntryPatch>[2]) =>
    upsert.mutate(applyEntryPatch(anime, entry, patch));
  const total = anime.episodes;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="lg"
              variant={entry ? "secondary" : "default"}
              className="min-w-40 justify-between"
            />
          }
        >
          <span className="flex items-center gap-2">
            {entry ? (
              <>
                <span
                  className={cn("size-2 rounded-full", ENTRY_STATUS_STYLES[entry.status].dot)}
                />
                {ENTRY_STATUS_LABELS[entry.status]}
              </>
            ) : (
              <>
                <Plus /> Add to library
              </>
            )}
          </span>
          <ChevronDown className="opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52">
          <DropdownMenuRadioGroup
            value={entry?.status ?? ""}
            onValueChange={(status) => save({ status: status as EntryStatus })}
          >
            {ENTRY_STATUSES.map((status) => (
              <DropdownMenuRadioItem key={status} value={status}>
                <span className={cn("size-2 rounded-full", ENTRY_STATUS_STYLES[status].dot)} />
                {ENTRY_STATUS_LABELS[status]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          {entry && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => remove.mutate(anime.id)}>
                <Trash2 /> Remove from library
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {entry && (
        <>
          <div
            className="flex h-9 items-center rounded-lg border bg-background/60"
            aria-label="Episode progress"
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous episode"
              disabled={entry.progress <= 0}
              onClick={() => save({ progress: entry.progress - 1 })}
            >
              <Minus />
            </Button>
            <span className="min-w-16 text-center text-sm tabular-nums">
              {entry.progress}
              <span className="text-muted-foreground"> / {total ?? "?"}</span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next episode"
              disabled={total !== null && entry.progress >= total}
              onClick={() => save({ progress: entry.progress + 1 })}
            >
              {total !== null && entry.progress + 1 === total ? <Check /> : <Plus />}
            </Button>
          </div>

          <ScoreSelect value={entry.score} onChange={(score) => save({ score })} />

          <Button
            variant="outline"
            size="icon-lg"
            aria-label={entry.isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={entry.isFavorite}
            onClick={() => save({ isFavorite: !entry.isFavorite })}
          >
            <Heart className={cn(entry.isFavorite && "fill-primary text-primary")} />
          </Button>
        </>
      )}
    </>
  );
}
