"use client";

import { SlidersHorizontal } from "lucide-react";
import type { GenreGroups } from "@/types/anime";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { countActiveFilters } from "@/lib/anime/filters";
import { useAnimeFilters } from "@/hooks/useAnimeFilters";
import { CatalogSearch } from "./CatalogSearch";
import { SortSelect } from "./SortSelect";
import { FilterPanel } from "./FilterPanel";
import { ActiveFilters } from "./ActiveFilters";
import { CatalogResults } from "./CatalogResults";

export function Catalog({ genres }: { genres: GenreGroups }) {
  const { filters, setFilters, resetFilters } = useAnimeFilters();
  const activeCount = countActiveFilters(filters);

  const panel = (
    <FilterPanel filters={filters} genres={genres} onChange={setFilters} onReset={resetFilters} />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Browse anime</h1>
        <p className="text-muted-foreground">
          Search the whole AniList catalog and narrow it down your way.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <CatalogSearch value={filters.q} onSearch={(q) => setFilters({ q }, "replace")} />
        <SortSelect value={filters.sort} onChange={(sort) => setFilters({ sort })} />
        <Sheet>
          <SheetTrigger render={<Button variant="outline" className="h-10 lg:hidden" />}>
            <SlidersHorizontal /> Filters
            {activeCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">
                {activeCount}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(22rem,90vw)] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6">{panel}</div>
          </SheetContent>
        </Sheet>
      </div>

      <ActiveFilters filters={filters} onChange={setFilters} onReset={resetFilters} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[15rem_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">{panel}</div>
        </aside>
        <CatalogResults filters={filters} onReset={resetFilters} />
      </div>
    </div>
  );
}
