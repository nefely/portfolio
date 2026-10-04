import { ENTRY_STATUSES, type Entry, type EntryStatus } from "@/types/library";

export type LibrarySort = "recent" | "title" | "score" | "progress";

export interface LibraryStats {
  total: number;
  byStatus: Record<EntryStatus, number>;
  episodesWatched: number;
  meanScore: number | null;
  favorites: number;
}

// Один прохід по масиву замість п'яти filter().length.
export function computeStats(entries: Entry[]): LibraryStats {
  const byStatus = Object.fromEntries(ENTRY_STATUSES.map((status) => [status, 0])) as Record<
    EntryStatus,
    number
  >;
  let episodesWatched = 0;
  let scoreSum = 0;
  let scored = 0;
  let favorites = 0;

  for (const entry of entries) {
    byStatus[entry.status]++;
    episodesWatched += entry.progress;
    if (entry.score !== null) {
      scoreSum += entry.score;
      scored++;
    }
    if (entry.isFavorite) favorites++;
  }

  return {
    total: entries.length,
    byStatus,
    episodesWatched,
    meanScore: scored ? Math.round((scoreSum / scored) * 100) / 100 : null,
    favorites,
  };
}

const SORTERS: Record<LibrarySort, (a: Entry, b: Entry) => number> = {
  recent: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  title: (a, b) => a.anime.title.localeCompare(b.anime.title),
  score: (a, b) => (b.score ?? -1) - (a.score ?? -1) || a.anime.title.localeCompare(b.anime.title),
  progress: (a, b) => progressRatio(b) - progressRatio(a),
};

function progressRatio(entry: Entry) {
  return entry.anime.episodes ? entry.progress / entry.anime.episodes : 0;
}

export function filterEntries(
  entries: Entry[],
  {
    status,
    search,
    sort,
  }: { status: EntryStatus | "all" | "favorites"; search: string; sort: LibrarySort },
) {
  const needle = search.trim().toLowerCase();
  return entries
    .filter((entry) => {
      if (status === "favorites" ? !entry.isFavorite : status !== "all" && entry.status !== status)
        return false;
      return !needle || entry.anime.title.toLowerCase().includes(needle);
    })
    .toSorted(SORTERS[sort]);
}
