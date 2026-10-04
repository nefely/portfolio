import type { EntryStatus } from "@/types/library";
import type { AnimeSeason, AnimeSort, AnimeStatus, AnimeType } from "./filters";

export const TYPE_LABELS: Record<AnimeType, string> = {
  tv: "TV",
  movie: "Movie",
  ova: "OVA",
  ona: "ONA",
  special: "Special",
  music: "Music",
};

export const AIRING_STATUS_LABELS: Record<AnimeStatus, string> = {
  airing: "Airing",
  complete: "Finished",
  upcoming: "Upcoming",
};

export const SEASON_LABELS: Record<AnimeSeason, string> = {
  winter: "Winter",
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
};

export const SORT_LABELS: Record<AnimeSort, string> = {
  popularity: "Most popular",
  trending: "Trending now",
  score: "Highest rated",
  newest: "Newest",
  oldest: "Oldest",
  title: "Title A–Z",
  favorites: "Most favorited",
};

export const ENTRY_STATUS_LABELS: Record<EntryStatus, string> = {
  watching: "Watching",
  completed: "Completed",
  planned: "Plan to watch",
  on_hold: "On hold",
  dropped: "Dropped",
};

// Класи прописані повністю, щоб Tailwind їх знайшов при скануванні.
export const ENTRY_STATUS_STYLES: Record<
  EntryStatus,
  { dot: string; text: string; badge: string }
> = {
  watching: {
    dot: "bg-status-watching",
    text: "text-status-watching",
    badge: "bg-status-watching/15 text-status-watching",
  },
  completed: {
    dot: "bg-status-completed",
    text: "text-status-completed",
    badge: "bg-status-completed/15 text-status-completed",
  },
  planned: {
    dot: "bg-status-planned",
    text: "text-status-planned",
    badge: "bg-status-planned/15 text-status-planned",
  },
  on_hold: {
    dot: "bg-status-on-hold",
    text: "text-status-on-hold",
    badge: "bg-status-on-hold/15 text-status-on-hold",
  },
  dropped: {
    dot: "bg-status-dropped",
    text: "text-status-dropped",
    badge: "bg-status-dropped/15 text-status-dropped",
  },
};

export function formatEpisodes(episodes: number | null) {
  if (episodes === null) return "? eps";
  return episodes === 1 ? "1 ep" : `${episodes} eps`;
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
export const formatCompact = (value: number | null) =>
  value === null ? "—" : compact.format(value);
