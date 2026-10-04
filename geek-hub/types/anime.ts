// Легкі моделі, якими оперує UI. AniList віддає десятки полів на тайтл — у
// сітках/списках нам треба 9, тож мапимо одразу на сервері, щоб не тягнути
// зайві кілобайти в RSC-payload і кеш TanStack Query.

export interface AnimeCard {
  // id AniList (він же в URL /anime/[id] і в колонці anime_id у Supabase).
  id: number;
  title: string;
  image: string | null;
  // Домінантний колір постера — фон-заглушка, поки картинка вантажиться.
  // Необов'язковий: старі знімки в jsonb могли зберегтися без нього.
  color?: string | null;
  // Шкала 0–10 (AniList рахує 0–100, ділимо на 10).
  score: number | null;
  type: string | null;
  episodes: number | null;
  year: number | null;
  status: string | null;
}

export interface AnimePage {
  items: AnimeCard[];
  page: number;
  hasNextPage: boolean;
  // AniList обрізає total до 5000 — UI показує "5,000+".
  total: number | null;
}

export interface AnimeTag {
  name: string;
  rank: number;
  isSpoiler: boolean;
}

export interface AnimeRelation {
  id: number;
  relation: string;
  title: string;
  format: string | null;
  isAnime: boolean;
}

export interface AnimeCharacter {
  id: number;
  name: string;
  image: string | null;
  role: string;
  voiceActor: { id: number; name: string; image: string | null } | null;
}

export interface AnimeDetails extends AnimeCard {
  titleRomaji: string;
  titleNative: string | null;
  imageLarge: string | null;
  banner: string | null;
  synopsis: string | null;
  source: string | null;
  duration: number | null;
  season: string | null;
  aired: string | null;
  nextEpisode: { episode: number; airingAt: number } | null;
  popularity: number | null;
  favorites: number | null;
  rankRated: number | null;
  rankPopular: number | null;
  trailerYoutubeId: string | null;
  studios: string[];
  genres: string[];
  tags: AnimeTag[];
  relations: AnimeRelation[];
  streaming: { name: string; url: string }[];
  characters: AnimeCharacter[];
  recommendations: AnimeCard[];
  malId: number | null;
  siteUrl: string;
}

export interface GenreGroups {
  genres: string[];
  themes: string[];
  settings: string[];
  demographics: string[];
}
