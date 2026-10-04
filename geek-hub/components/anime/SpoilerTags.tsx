"use client";

import { useState } from "react";
import Link from "next/link";
import type { AnimeTag } from "@/types/anime";

const VISIBLE_COUNT = 12;

// Частина тегів AniList — спойлери ("Twist ending", "Character death"):
// ховаємо їх, доки користувач сам не попросить показати.
export function SpoilerTags({ tags }: { tags: AnimeTag[] }) {
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const spoilerCount = tags.filter((tag) => tag.isSpoiler).length;
  const visibleTags = tags.filter((tag) => showSpoilers || !tag.isSpoiler);
  const shown = expanded ? visibleTags : visibleTags.slice(0, VISIBLE_COUNT);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">Tags</h2>
        {spoilerCount > 0 && (
          <button
            type="button"
            onClick={() => setShowSpoilers((value) => !value)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showSpoilers ? "Hide spoilers" : `Show ${spoilerCount} spoiler tags`}
          </button>
        )}
      </div>
      <ul className="space-y-1.5 text-sm">
        {shown.map((tag) => (
          <li key={tag.name} className="flex items-center justify-between gap-2">
            <Link
              href={`/anime?tags=${encodeURIComponent(tag.name)}`}
              className={tag.isSpoiler ? "text-destructive hover:underline" : "hover:text-primary"}
            >
              {tag.name}
            </Link>
            <span className="text-xs text-muted-foreground tabular-nums">{tag.rank}%</span>
          </li>
        ))}
      </ul>
      {visibleTags.length > VISIBLE_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="text-xs font-medium text-primary hover:underline"
        >
          {expanded ? "Show less" : `Show all ${visibleTags.length}`}
        </button>
      )}
    </section>
  );
}
