import type { SupabaseClient } from "@supabase/supabase-js";
import type { Review, ReviewInput } from "@/types/library";
import { mapAuthorRow } from "./lists";

const TABLE = "geek_hub_reviews";
const COLUMNS = `id, anime_id, score, body, has_spoilers, created_at, updated_at,
  author:geek_hub_profiles (user_id, username, display_name)`;

export const REVIEWS_PAGE_SIZE = 10;

interface ReviewRow {
  id: string;
  anime_id: number;
  score: number;
  body: string;
  has_spoilers: boolean;
  created_at: string;
  updated_at: string;
  author: { user_id: string; username: string; display_name: string | null } | null;
}

function mapReviewRow(row: ReviewRow): Review {
  return {
    id: row.id,
    animeId: row.anime_id,
    score: row.score,
    body: row.body,
    hasSpoilers: row.has_spoilers,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: mapAuthorRow(row.author),
  };
}

export interface ReviewsPage {
  reviews: Review[];
  total: number;
  nextPage: number | null;
}

export async function fetchReviews(
  supabase: SupabaseClient,
  animeId: number,
  page: number,
): Promise<ReviewsPage> {
  const from = page * REVIEWS_PAGE_SIZE;
  const { data, error, count } = await supabase
    .from(TABLE)
    .select(COLUMNS, { count: "exact" })
    .eq("anime_id", animeId)
    .order("created_at", { ascending: false })
    .range(from, from + REVIEWS_PAGE_SIZE - 1);

  if (error) throw new Error(error.message);
  const total = count ?? 0;
  return {
    reviews: (data as unknown as ReviewRow[]).map(mapReviewRow),
    total,
    nextPage: from + REVIEWS_PAGE_SIZE < total ? page + 1 : null,
  };
}

export async function fetchMyReview(supabase: SupabaseClient, userId: string, animeId: number) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq("user_id", userId)
    .eq("anime_id", animeId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapReviewRow(data as unknown as ReviewRow) : null;
}

export async function upsertReview(supabase: SupabaseClient, userId: string, input: ReviewInput) {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        user_id: userId,
        anime_id: input.animeId,
        score: input.score,
        body: input.body,
        has_spoilers: input.hasSpoilers,
      },
      { onConflict: "user_id,anime_id" },
    )
    .select(COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return mapReviewRow(data as unknown as ReviewRow);
}

export async function deleteReview(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
