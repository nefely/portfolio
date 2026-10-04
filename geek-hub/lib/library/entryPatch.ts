import type { AnimeCard } from "@/types/anime";
import type { Entry, EntryInput } from "@/types/library";

// Правила, які роблять трекінг "розумним": завершений тайтл = усі епізоди,
// останній епізод = завершено. Чиста функція — легко тестувати.
export function applyEntryPatch(
  anime: AnimeCard,
  current: Entry | null,
  patch: Partial<Omit<EntryInput, "animeId" | "anime">>,
): EntryInput {
  const base: EntryInput = {
    animeId: anime.id,
    anime,
    status: current?.status ?? "planned",
    progress: current?.progress ?? 0,
    score: current?.score ?? null,
    isFavorite: current?.isFavorite ?? false,
    notes: current?.notes ?? null,
  };
  const next: EntryInput = { ...base, ...patch };
  const total = anime.episodes;

  if (total !== null) next.progress = Math.min(Math.max(next.progress, 0), total);
  else next.progress = Math.max(next.progress, 0);

  if (patch.status === "completed" && total !== null) next.progress = total;
  if (patch.progress !== undefined && total !== null && next.progress === total && total > 0) {
    next.status = "completed";
  } else if (patch.progress !== undefined && next.progress > 0 && next.status === "planned") {
    // Почав дивитись запланований тайтл — він тепер "Watching".
    next.status = "watching";
  }
  return next;
}
