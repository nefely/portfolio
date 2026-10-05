"use client";

import { useEffect } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimeGrid, GRID_CLASSES } from "@/components/anime/AnimeGrid";
import { uniqueById } from "@/lib/anilist/mappers";
import { animeSearchOptions } from "@/lib/query/animeSearch";
import type { AnimeFilters } from "@/lib/anime/filters";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

export function CatalogResults({
  filters,
  onReset,
}: {
  filters: AnimeFilters;
  onReset: () => void;
}) {
  const query = useInfiniteQuery({
    ...animeSearchOptions(filters),
    // Поки вантажаться нові фільтри, лишаємо на екрані попередні результати
    // (притемнені) замість миготіння скелетона.
    placeholderData: keepPreviousData,
  });
  const { ref: sentinelRef, inView } = useInView<HTMLDivElement>();

  const { hasNextPage, isFetchingNextPage, fetchNextPage, isPlaceholderData } = query;
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isPlaceholderData) void fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, isPlaceholderData, fetchNextPage]);

  if (query.isPending) return <ResultsSkeleton />;

  if (query.isError && !query.data) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="font-medium">The anime database didn&apos;t respond.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          AniList is rate-limited — give it a second.
        </p>
        <Button className="mt-4" onClick={() => query.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  // AniList може повторити тайтл на сусідніх сторінках (порядок зсувається
  // між запитами) — дублікати ламають key. Лічильник результатів не
  // показуємо: pageInfo.total в AniList приблизний (часто просто 5000).
  const items = uniqueById(query.data.pages.flatMap((page) => page.items));

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed p-12 text-center">
        <SearchX className="size-10 text-muted-foreground" />
        <p className="mt-3 font-medium">
          {filters.q ? `No anime found for “${filters.q}”.` : "Nothing matches these filters."}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {filters.q
            ? "Check the spelling, try the English or Japanese title, or remove some filters."
            : "Try removing a genre or widening the year."}
        </p>
        <Button variant="outline" className="mt-4" onClick={onReset}>
          Reset filters
        </Button>
      </div>
    );
  }

  return (
    <div>
      {query.data.pages[0]?.approximate && (
        <p className="mb-4 text-sm text-muted-foreground">
          Showing popular titles that start with “{filters.q}”. Finish the word for a full search.
        </p>
      )}
      <div
        className={cn("transition-opacity", isPlaceholderData && "pointer-events-none opacity-50")}
      >
        <AnimeGrid items={items} />
      </div>
      <div ref={sentinelRef} className="flex h-24 items-center justify-center">
        {isFetchingNextPage && (
          <Loader2
            className="size-6 animate-spin text-muted-foreground"
            aria-label="Loading more"
          />
        )}
        {query.isFetchNextPageError && (
          <Button variant="outline" onClick={() => fetchNextPage()}>
            Load more
          </Button>
        )}
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className={GRID_CLASSES} aria-busy aria-label="Loading anime">
      {Array.from({ length: 18 }, (_, index) => (
        <div key={index}>
          <Skeleton className="aspect-2/3 w-full rounded-xl" />
          <Skeleton className="mt-2 h-4 w-4/5" />
          <Skeleton className="mt-1 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
