"use client";

import { memo } from "react";
import type { AnimeCard as AnimeCardData } from "@/types/anime";
import { AnimeCard } from "./AnimeCard";
import { cn } from "@/lib/utils";

// Явний memo поверх React Compiler: коли infinite query дописує нову
// сторінку, масив карток новий, але об'єкти старих карток ті самі (structural
// sharing TanStack) — memo гарантує, що вже показані картки не рендеряться знову.
const MemoAnimeCard = memo(AnimeCard);

export const GRID_CLASSES =
  "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

export function AnimeGrid({
  items,
  className,
  priorityCount = 6,
}: {
  items: AnimeCardData[];
  className?: string;
  priorityCount?: number;
}) {
  return (
    <div className={cn(GRID_CLASSES, className)}>
      {items.map((anime, index) => (
        <MemoAnimeCard key={anime.id} anime={anime} priority={index < priorityCount} />
      ))}
    </div>
  );
}
