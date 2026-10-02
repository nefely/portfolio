"use client";

import type { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "@/i18n/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FAVORITES_TABLE, createClient } from "@/lib/supabase/client";

// Client-side auth + favorites state. Favorites are read/written straight from
// the browser with the anon key; Row Level Security on ai_radar_favorites makes
// sure a user only ever touches their own rows. Keeping this on the client means
// catalog pages stay cacheable (no cookies read during server render).

type Status = "loading" | "guest" | "authed";

type AuthContextValue = {
  user: User | null;
  status: Status;
  favorites: string[];
  favoritesError: string | null;
  isFavorite: (domain: string) => boolean;
  toggleFavorite: (domain: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  const loadFavorites = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from(FAVORITES_TABLE)
        .select("domain")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) {
        setFavoritesError(error.message);
        return;
      }
      setFavoritesError(null);
      setFavorites(data.map((r) => r.domain as string));
    },
    [supabase],
  );

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setStatus(nextUser ? "authed" : "guest");
      if (nextUser) {
        // defer: Supabase recommends not awaiting other calls inside this callback
        setTimeout(() => void loadFavorites(nextUser.id), 0);
      } else {
        setFavorites([]);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase, loadFavorites]);

  const toggleFavorite = useCallback(
    async (domain: string) => {
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      const wasFavorite = favorites.includes(domain);
      // optimistic update, rolled back on error
      setFavorites((prev) => (wasFavorite ? prev.filter((d) => d !== domain) : [domain, ...prev]));

      const { error } = wasFavorite
        ? await supabase.from(FAVORITES_TABLE).delete().eq("user_id", user.id).eq("domain", domain)
        : await supabase.from(FAVORITES_TABLE).insert({ user_id: user.id, domain });

      if (error) {
        setFavoritesError(error.message);
        setFavorites((prev) => (wasFavorite ? [domain, ...prev] : prev.filter((d) => d !== domain)));
      }
    },
    [user, favorites, supabase, router, pathname],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.refresh();
  }, [supabase, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      favorites,
      favoritesError,
      isFavorite: (d) => favorites.includes(d),
      toggleFavorite,
      signOut,
    }),
    [user, status, favorites, favoritesError, toggleFavorite, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
