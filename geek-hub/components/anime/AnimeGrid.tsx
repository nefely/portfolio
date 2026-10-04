"use client";

import { memo } from "react";
import type { AnimeCard as AnimeCardData } from "@/types/anime";
import { Reveal } from "@/components/motion/Reveal";
import { AnimeCard } from "./AnimeCard";
import { cn } from "@/lib/utils";

export const GRID_CLASSES =
  "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

// Максимум колонок сітки — затримка появи йде "хвилею" в межах ряду.
const MAX_COLUMNS = 6;

// Явний memo поверх React Compiler: коли infinite query дописує нову
// сторінку, масив карток новий, але об'єкти старих карток ті самі (structural
// sharing TanStack) — memo гарантує, що вже показані картки (разом з їхньою
// анімацією появи) не рендеряться знову.
const GridItem = memo(function GridItem({
  anime,
  index,
  priority,
}: {
  anime: AnimeCardData;
  index: number;
  priority: boolean;
}) {
  return (
    <Reveal index={index % MAX_COLUMNS}>
      <AnimeCard anime={anime} priority={priority} />
    </Reveal>
  );
});

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
        <GridItem key={anime.id} anime={anime} index={index} priority={index < priorityCount} />
      ))}
    </div>
  );
}
