import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnimeCard } from "@/types/anime";
import type { AnimeList, AnimeListWithAuthor, Author, ListInput } from "@/types/library";

const LISTS = "geek_hub_lists";
const ITEMS = "geek_hub_list_items";
const LIST_COLUMNS = `id, user_id, title, description, is_public, created_at, updated_at,
  items:${ITEMS} (anime_id, anime, added_at)`;

interface ListRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  items: { anime_id: number; anime: AnimeCard; added_at: string }[];
}

interface AuthorRow {
  user_id: string;
  username: string;
  display_name: string | null;
}

export function mapAuthorRow(row: AuthorRow | null): Author | null {
  return row
    ? { userId: row.user_id, username: row.username, displayName: row.display_name }
    : null;
}

export function mapListRow(row: ListRow): AnimeList {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Нові тайтли — вгорі списку.
    items: row.items
      .map((item) => ({ animeId: item.anime_id, anime: item.anime, addedAt: item.added_at }))
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt)),
  };
}

export async function fetchMyLists(supabase: SupabaseClient, userId: string): Promise<AnimeList[]> {
  const { data, error } = await supabase
    .from(LISTS)
    .select(LIST_COLUMNS)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as unknown as ListRow[]).map(mapListRow);
}

// Для публічної сторінки списку: RLS сам поверне null для чужого приватного.
export async function fetchList(
  supabase: SupabaseClient,
  id: string,
): Promise<AnimeListWithAuthor | null> {
  const { data, error } = await supabase
    .from(LISTS)
    .select(`${LIST_COLUMNS}, author:geek_hub_profiles (user_id, username, display_name)`)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as unknown as ListRow & { author: AuthorRow | null };
  return { ...mapListRow(row), author: mapAuthorRow(row.author) };
}

export async function createList(supabase: SupabaseClient, userId: string, input: ListInput) {
  const { data, error } = await supabase
    .from(LISTS)
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description,
      is_public: input.isPublic,
    })
    .select(LIST_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return mapListRow(data as unknown as ListRow);
}

export async function updateList(supabase: SupabaseClient, id: string, input: ListInput) {
  const { error } = await supabase
    .from(LISTS)
    .update({ title: input.title, description: input.description, is_public: input.isPublic })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteList(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(LISTS).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function addToList(supabase: SupabaseClient, listId: string, anime: AnimeCard) {
  const { error } = await supabase
    .from(ITEMS)
    .upsert(
      { list_id: listId, anime_id: anime.id, anime },
      { onConflict: "list_id,anime_id", ignoreDuplicates: true },
    );
  if (error) throw new Error(error.message);
}

export async function removeFromList(supabase: SupabaseClient, listId: string, animeId: number) {
  const { error } = await supabase
    .from(ITEMS)
    .delete()
    .eq("list_id", listId)
    .eq("anime_id", animeId);
  if (error) throw new Error(error.message);
}
