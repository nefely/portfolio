"use client";

import { memo, useDeferredValue, useState } from "react";
import Link from "next/link";
import { Clapperboard, Heart, Search, Star, Tv } from "lucide-react";
import { ENTRY_STATUSES, type Entry, type EntryStatus } from "@/types/library";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENTRY_STATUS_LABELS, ENTRY_STATUS_STYLES } from "@/lib/anime/labels";
import { computeStats, filterEntries, type LibrarySort } from "@/lib/library/stats";
import { useMyEntries } from "@/hooks/useEntries";
import { cn } from "@/lib/utils";
import { GRID_CLASSES } from "@/components/anime/AnimeGrid";
import { LibraryCard } from "./LibraryCard";

type Tab = EntryStatus | "all" | "favorites";

const SORT_ITEMS: { value: LibrarySort; label: string }[] = [
  { value: "recent", label: "Recently updated" },
  { value: "title", label: "Title A–Z" },
  { value: "score", label: "My score" },
  { value: "progress", label: "Progress" },
];

// Структурний шарінг TanStack + memo: після +1 епізоду змінюється один
// об'єкт Entry, тож перерендерюється одна картка, а не вся бібліотека.
const MemoLibraryCard = memo(LibraryCard);

export function LibraryView() {
  const { data: entries, isPending, isError } = useMyEntries();
  const [tab, setTab] = useState<Tab>("all");
  const [sort, setSort] = useState<LibrarySort>("recent");
  const [search, setSearch] = useState("");
  // Інпут оновлюється миттєво, а фільтрація великої бібліотеки — з низьким
  // пріоритетом, не блокуючи набір тексту.
  const deferredSearch = useDeferredValue(search);

  if (isPending) return <LibrarySkeleton />;
  if (isError)
    return (
      <p className="mx-auto max-w-7xl px-4 py-10 text-destructive sm:px-6">
        Couldn&apos;t load your library.
      </p>
    );

  const stats = computeStats(entries);
  const visible = filterEntries(entries, { status: tab, search: deferredSearch, sort });
  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: "all", label: "All", count: stats.total },
    ...ENTRY_STATUSES.map((status) => ({
      value: status,
      label: ENTRY_STATUS_LABELS[status],
      count: stats.byStatus[status],
    })),
    { value: "favorites", label: "Favorites", count: stats.favorites },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">My library</h1>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Clapperboard} label="Titles" value={stats.total} />
        <Stat
          icon={Tv}
          label="Episodes watched"
          value={stats.episodesWatched.toLocaleString("en")}
        />
        <Stat icon={Star} label="Mean score" value={stats.meanScore?.toFixed(2) ?? "—"} />
        <Stat icon={Heart} label="Favorites" value={stats.favorites} />
      </dl>

      {stats.total > 0 && <StatusBar stats={stats.byStatus} total={stats.total} />}

      <div
        className="-mx-4 mt-8 scrollbar-none flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0"
        role="tablist"
      >
        {tabs.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              tab === item.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {item.label}
            <span className="text-xs opacity-70">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="relative min-w-0 flex-1 basis-56">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter your library…"
            className="h-10 pl-9"
            aria-label="Filter library"
          />
        </div>
        <Select
          items={SORT_ITEMS}
          value={sort}
          onValueChange={(next) => next && setSort(next as LibrarySort)}
        >
          <SelectTrigger aria-label="Sort library" className="h-10! w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        {stats.total === 0 ? (
          <EmptyLibrary />
        ) : visible.length === 0 ? (
          <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </p>
        ) : (
          <div className={GRID_CLASSES}>
            {visible.map((entry: Entry) => (
              <MemoLibraryCard key={entry.animeId} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function StatusBar({ stats, total }: { stats: Record<EntryStatus, number>; total: number }) {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
        {ENTRY_STATUSES.map((status) =>
          stats[status] ? (
            <div
              key={status}
              className={ENTRY_STATUS_STYLES[status].dot}
              style={{ width: `${(stats[status] / total) * 100}%` }}
            />
          ) : null,
        )}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {ENTRY_STATUSES.map((status) => (
          <li key={status} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", ENTRY_STATUS_STYLES[status].dot)} />
            {ENTRY_STATUS_LABELS[status]}{" "}
            <span className="text-foreground tabular-nums">{stats[status]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyLibrary() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed p-12 text-center">
      <Clapperboard className="size-10 text-muted-foreground" />
      <p className="mt-3 font-medium">Your library is empty</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Find something to watch and add it to start tracking.
      </p>
      <Link href="/anime" className={buttonVariants({ className: "mt-4" })}>
        Browse anime
      </Link>
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6" aria-busy>
      <Skeleton className="h-9 w-48" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className={GRID_CLASSES}>
        {Array.from({ length: 12 }, (_, index) => (
          <Skeleton key={index} className="aspect-2/3 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
