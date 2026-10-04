import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types/library";

const TABLE = "geek_hub_profiles";

interface ProfileRow {
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
}

function mapProfileRow(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
  };
}

export async function fetchProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("user_id, username, display_name, bio")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapProfileRow(data as ProfileRow) : null;
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  input: { username: string; displayName: string | null; bio: string | null },
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ username: input.username, display_name: input.displayName, bio: input.bio })
    .eq("user_id", userId)
    .select("user_id, username, display_name, bio")
    .single();

  if (error) throw error;
  return mapProfileRow(data as ProfileRow);
}
