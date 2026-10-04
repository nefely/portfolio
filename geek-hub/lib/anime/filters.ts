// Єдине джерело правди для фільтрів каталогу: URL ⇄ AnimeFilters ⇄ AniList.
// Чисті функції без залежностей — працюють і на сервері (prefetch у page.tsx,
// route handler), і на клієнті (useAnimeFilters), тож ключ кешу TanStack
// Query збігається з обох боків і гідратація не робить зайвого запиту.

export const ANIME_TYPES = ["tv", "movie", "ova", "ona", "special", "music"] as const;
export const ANIME_STATUSES = ["airing", "complete", "upcoming"] as const;
export const ANIME_SEASONS = ["winter", "spring", "summer", "fall"] as const;
export const ANIME_SORTS = [
  "popularity",
  "trending",
  "score",
  "newest",
  "oldest",
  "title",
  "favorites",
] as const;

export type AnimeType = (typeof ANIME_TYPES)[number];
export type AnimeStatus = (typeof ANIME_STATUSES)[number];
export type AnimeSeason = (typeof ANIME_SEASONS)[number];
export type AnimeSort = (typeof ANIME_SORTS)[number];

export interface AnimeFilters {
  q: string;
  genres: string[];
  tags: string[];
  type: AnimeType | null;
  status: AnimeStatus | null;
  season: AnimeSeason | null;
  year: number | null;
  minScore: number | null;
  sort: AnimeSort;
}

export const DEFAULT_FILTERS: AnimeFilters = {
  q: "",
  genres: [],
  tags: [],
  type: null,
  status: null,
  season: null,
  year: null,
  minScore: null,
  sort: "popularity",
};

// Кратне 2/3/4/6 колонкам сітки; AniList дозволяє до 50.
export const PAGE_SIZE = 24;

export const MIN_YEAR = 1960;
export const MAX_YEAR = new Date().getFullYear() + 2;

const MAX_NAMES = 10;
// Назви жанрів/тегів AniList: літери, цифри, пробіли, дефіси, апострофи, "&".
const NAME_PATTERN = /^[\p{L}\p{N} '&\-.]{1,40}$/u;

type ParamsInput = URLSearchParams | Record<string, string | string[] | undefined>;

function readParam(params: ParamsInput, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function oneOf<T extends string>(allowed: readonly T[], value: string | undefined): T | null {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

function intInRange(value: string | undefined, min: number, max: number): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return number >= min && number <= max ? number : null;
}

// Сортуємо й прибираємо дублікати, щоб "Drama,Action" і "Action,Drama"
// давали один ключ кешу.
function parseNames(value: string | undefined): string[] {
  const names = (value ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter((name) => NAME_PATTERN.test(name));
  return [...new Set(names)].sort((a, b) => a.localeCompare(b)).slice(0, MAX_NAMES);
}

// URL контролює будь-хто (ручне редагування, старі посилання) — все невалідне
// тихо відкидаємо до дефолту, а не кидаємо помилку.
export function parseFilters(params: ParamsInput): AnimeFilters {
  return {
    q: (readParam(params, "q") ?? "").trim().slice(0, 100),
    genres: parseNames(readParam(params, "genres")),
    tags: parseNames(readParam(params, "tags")),
    type: oneOf(ANIME_TYPES, readParam(params, "type")),
    status: oneOf(ANIME_STATUSES, readParam(params, "status")),
    season: oneOf(ANIME_SEASONS, readParam(params, "season")),
    year: intInRange(readParam(params, "year"), MIN_YEAR, MAX_YEAR),
    minScore: intInRange(readParam(params, "minScore"), 1, 9),
    sort: oneOf(ANIME_SORTS, readParam(params, "sort")) ?? DEFAULT_FILTERS.sort,
  };
}

// Канонічний query-рядок: фіксований порядок ключів, дефолти не пишемо.
// Він же — ключ кешу (див. queryKeys.animeSearch).
export function serializeFilters(filters: AnimeFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.genres.length) params.set("genres", filters.genres.join(","));
  if (filters.tags.length) params.set("tags", filters.tags.join(","));
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);
  if (filters.season) params.set("season", filters.season);
  if (filters.year) params.set("year", String(filters.year));
  if (filters.minScore) params.set("minScore", String(filters.minScore));
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  return params.toString();
}

export function countActiveFilters(filters: AnimeFilters): number {
  return (
    filters.genres.length +
    filters.tags.length +
    [filters.type, filters.status, filters.season, filters.year, filters.minScore].filter(
      (value) => value !== null,
    ).length
  );
}

const SORT_TO_ANILIST: Record<AnimeSort, string[]> = {
  popularity: ["POPULARITY_DESC"],
  trending: ["TRENDING_DESC", "POPULARITY_DESC"],
  score: ["SCORE_DESC"],
  newest: ["START_DATE_DESC"],
  oldest: ["START_DATE"],
  title: ["TITLE_ROMAJI"],
  favorites: ["FAVOURITES_DESC"],
};

const TYPE_TO_FORMATS: Record<AnimeType, string[]> = {
  tv: ["TV", "TV_SHORT"],
  movie: ["MOVIE"],
  ova: ["OVA"],
  ona: ["ONA"],
  special: ["SPECIAL"],
  music: ["MUSIC"],
};

const STATUS_TO_ANILIST: Record<AnimeStatus, string> = {
  airing: "RELEASING",
  complete: "FINISHED",
  upcoming: "NOT_YET_RELEASED",
};

// Змінні GraphQL-запиту каталогу. null AniList трактує як "фільтр не задано".
export function toAniListVariables(filters: AnimeFilters, page: number) {
  const withSeason = Boolean(filters.year && filters.season);
  return {
    page,
    perPage: PAGE_SIZE,
    search: filters.q || null,
    // Пошуковий запит без явного сортування — найрелевантніші першими.
    sort:
      filters.q && filters.sort === "popularity" ? ["SEARCH_MATCH"] : SORT_TO_ANILIST[filters.sort],
    genres: filters.genres.length ? filters.genres : null,
    tags: filters.tags.length ? filters.tags : null,
    formats: filters.type ? TYPE_TO_FORMATS[filters.type] : null,
    status: filters.status ? STATUS_TO_ANILIST[filters.status] : null,
    season: withSeason ? filters.season!.toUpperCase() : null,
    seasonYear: withSeason ? filters.year : null,
    // Рік без сезону — за датою старту (FuzzyDateInt YYYYMMDD), щоб не губити
    // тайтли без seasonYear (фільми, спешли).
    startFrom: filters.year && !withSeason ? filters.year * 10_000 : null,
    startTo: filters.year && !withSeason ? (filters.year + 1) * 10_000 : null,
    // "7+" → averageScore > 69 (шкала AniList 0–100).
    minScore: filters.minScore ? filters.minScore * 10 - 1 : null,
  };
}

export type AniListSearchVariables = ReturnType<typeof toAniListVariables>;
