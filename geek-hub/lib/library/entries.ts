import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnimeCard } from "@/types/anime";
import type { Entry, EntryInput, EntryStatus } from "@/types/library";

// Data access приймає клієнт параметром і однаково працює з серверним
// (prefetch у page.tsx) і браузерним (useQuery/useMutation) Supabase —
// тож гідратований кеш і клієнтські запити мають ідентичну форму.

const TABLE = "geek_hub_entries";
const COLUMNS = "id, anime_id, status, progress, score, is_favorite, notes, anime, updated_at";

interface EntryRow {
  id: string;
  anime_id: number;
  status: EntryStatus;
  progress: number;
  score: number | null;
  is_favorite: boolean;
  notes: string | null;
  anime: AnimeCard;
  updated_at: string;
}

export function mapEntryRow(row: EntryRow): Entry {
  return {
    id: row.id,
    animeId: row.anime_id,
    status: row.status,
    progress: row.progress,
    score: row.score,
    isFavorite: row.is_favorite,
    notes: row.notes,
    anime: row.anime,
    updatedAt: row.updated_at,
  };
}

// Бібліотека одного користувача — сотні рядків, не мільйони: тягнемо всю
// одним запитом, а фільтри/сортування/статистику рахуємо на клієнті з кешу.
export async function fetchEntries(supabase: SupabaseClient, userId: string): Promise<Entry[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as EntryRow[]).map(mapEntryRow);
}

export async function upsertEntry(
  supabase: SupabaseClient,
  userId: string,
  input: EntryInput,
): Promise<Entry> {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        user_id: userId,
        anime_id: input.animeId,
        status: input.status,
        progress: input.progress,
        score: input.score,
        is_favorite: input.isFavorite,
        notes: input.notes,
        anime: input.anime,
      },
      { onConflict: "user_id,anime_id" },
    )
    .select(COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return mapEntryRow(data as EntryRow);
}

export async function deleteEntry(supabase: SupabaseClient, userId: string, animeId: number) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("anime_id", animeId);
  if (error) throw new Error(error.message);
}
