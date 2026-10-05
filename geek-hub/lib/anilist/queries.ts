import "server-only";

import { cache } from "react";
import type { AnimeCard, AnimeDetails, AnimePage, GenreGroups } from "@/types/anime";
import { toAniListVariables, type AnimeFilters } from "@/lib/anime/filters";
import { ApiError } from "@/lib/api/retry";
import { anilistQuery, REVALIDATE } from "./client";
import { toAnimeCard, toAnimeDetails, toAnimePage, toGenreGroups, uniqueById } from "./mappers";
import { buildSearchQuery } from "./searchQuery";
import { searchPrefixIndex, tokenize, type PrefixIndexEntry } from "./prefixSearch";
import type { AniListMediaCard, AniListMediaFull, AniListPage, AniListTag } from "./types";

// cache() дедуплікує виклики в межах одного рендера (generateMetadata +
// page, кілька полиць на головній), а Data Cache з anilistQuery — між запитами.

// Спільний фрагмент картки: рівно ті поля, що потрібні AnimeCard.
const CARD_FIELDS = `
  id
  title { romaji english }
  coverImage { large color }
  format
  episodes
  seasonYear
  startDate { year }
  status
  averageScore
`;

export async function searchAnime(filters: AnimeFilters, page: number): Promise<AnimePage> {
  const { query, variables } = buildSearchQuery(toAniListVariables(filters, page), CARD_FIELDS);
  const usePrefix = Boolean(filters.q) && page === 1;

  // Повнотекстовий пошук AniList і префіксний індекс — паралельно.
  const [anilist, prefix] = await Promise.allSettled([
    anilistQuery<{ Page: AniListPage }>(query, variables, { revalidate: REVALIDATE.short }),
    usePrefix
      ? getPrefixIndex().then((index) => searchPrefixIndex(index, filters, PREFIX_RESULTS))
      : Promise.resolve(null),
  ]);
  const prefixMatches = prefix.status === "fulfilled" ? prefix.value : null;

  if (anilist.status === "rejected") {
    // AniList недоступний або вперлись у ліміт (429) — не падаємо, якщо є
    // збіги в індексі популярних тайтлів.
    if (!prefixMatches?.length) throw anilist.reason;
    return { items: prefixMatches, page, hasNextPage: false, total: null, approximate: true };
  }

  const result = toAnimePage(anilist.value.Page);
  if (!prefixMatches?.length) return result;

  // Популярні тайтли, чиї назви починаються з набраного, — першими; далі
  // повнотекстові результати AniList без дублікатів. Наступні сторінки — вже
  // тільки AniList (дублікати між сторінками прибирає клієнт).
  return {
    ...result,
    items: uniqueById([...prefixMatches, ...result.items]),
    approximate: result.items.length === 0,
  };
}

// ---------------------------------------------------------------------------
// Префіксний індекс (див. lib/anilist/prefixSearch.ts — навіщо він)
// ---------------------------------------------------------------------------

const PREFIX_INDEX_PAGES = 20; // × 50 = 1000 найпопулярніших тайтлів
const PREFIX_RESULTS = 24;

const INDEX_QUERY = `
  query PrefixIndex($page: Int) {
    Page(page: $page, perPage: 50) {
      media(type: ANIME, isAdult: false, sort: [POPULARITY_DESC]) {
        ${CARD_FIELDS}
        title { romaji english native }
        synonyms
        genres
        season
        startDate { year month day }
      }
    }
  }
`;

type IndexMedia = AniListMediaCard & {
  title: { romaji: string | null; english: string | null; native: string | null };
  synonyms: string[];
  genres: string[];
  season: string | null;
  startDate: { year: number | null; month: number | null; day: number | null } | null;
};

function toIndexEntry(media: IndexMedia): PrefixIndexEntry {
  const date = media.startDate;
  const toNames = (list: (string | null)[]) =>
    list
      .filter((name): name is string => Boolean(name))
      .map(tokenize)
      .filter((words) => words.length > 0);
  const titles = toNames([media.title.english, media.title.romaji]);
  return {
    card: toAnimeCard(media),
    names: [...titles, ...toNames(media.synonyms)],
    titleCount: titles.length,
    genres: media.genres,
    format: media.format,
    status: media.status,
    season: media.season,
    startDate: date?.year ? date.year * 10_000 + (date.month ?? 0) * 100 + (date.day ?? 0) : 0,
  };
}

let indexMemo: { promise: Promise<PrefixIndexEntry[]>; expires: number } | null = null;

// Кожна сторінка індексу лежить у Data Cache тиждень, а зібраний індекс ще й
// у пам'яті процесу, тож пошук за ним не робить жодного мережевого запиту.
// Сторінки тягнемо партіями по 5, щоб не впертися в ліміт AniList.
async function getPrefixIndex(): Promise<PrefixIndexEntry[]> {
  if (indexMemo && indexMemo.expires > Date.now()) return indexMemo.promise;

  const promise = (async () => {
    const pages: IndexMedia[][] = [];
    for (let start = 1; start <= PREFIX_INDEX_PAGES; start += 5) {
      const batch = await Promise.all(
        Array.from({ length: Math.min(5, PREFIX_INDEX_PAGES - start + 1) }, (_, offset) =>
          anilistQuery<{ Page: { media: IndexMedia[] } }>(
            INDEX_QUERY,
            { page: start + offset },
            { revalidate: REVALIDATE.long },
          ).then((data) => data.Page.media),
        ),
      );
      pages.push(...batch);
    }
    return uniqueById(pages.flat()).map(toIndexEntry);
  })();

  indexMemo = { promise, expires: Date.now() + REVALIDATE.long * 1000 };
  // Збій не кешуємо — наступний пошук спробує зібрати індекс ще раз.
  promise.catch(() => {
    indexMemo = null;
  });
  return promise;
}

const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;

export function currentSeason(date = new Date()) {
  return { season: SEASONS[Math.floor(date.getMonth() / 3)], year: date.getFullYear() };
}

// Усі полиці головної — ОДНИМ GraphQL-запитом з аліасами замість чотирьох
// окремих: один round-trip, один запис у кеші, вчетверо менше ліміту AniList.
const HOME_QUERY = `
  query Home($season: MediaSeason, $seasonYear: Int) {
    trending: Page(perPage: 18) { media(type: ANIME, isAdult: false, sort: [TRENDING_DESC]) { ${CARD_FIELDS} } }
    season: Page(perPage: 18) {
      media(type: ANIME, isAdult: false, season: $season, seasonYear: $seasonYear, sort: [POPULARITY_DESC]) { ${CARD_FIELDS} }
    }
    top: Page(perPage: 18) { media(type: ANIME, isAdult: false, sort: [SCORE_DESC]) { ${CARD_FIELDS} } }
    upcoming: Page(perPage: 18) {
      media(type: ANIME, isAdult: false, status: NOT_YET_RELEASED, sort: [POPULARITY_DESC]) { ${CARD_FIELDS} }
    }
  }
`;

export type HomeShelf = "trending" | "season" | "top" | "upcoming";

export const getHomeShelves = cache(async (): Promise<Record<HomeShelf, AnimeCard[]>> => {
  const data = await anilistQuery<Record<HomeShelf, { media: AniListMediaCard[] }>>(
    HOME_QUERY,
    currentSeason(),
    {
      revalidate: REVALIDATE.short,
    },
  );
  const toCards = (shelf: HomeShelf) => uniqueById(data[shelf].media.map(toAnimeCard));
  return {
    trending: toCards("trending"),
    season: toCards("season"),
    top: toCards("top"),
    upcoming: toCards("upcoming"),
  };
});

// Деталі, персонажі й рекомендації — теж одним запитом (замість трьох окремих).
const DETAILS_QUERY = `
  query Details($id: Int) {
    Media(id: $id, type: ANIME) {
      ${CARD_FIELDS}
      idMal
      title { romaji english native }
      coverImage { large extraLarge color }
      bannerImage
      description(asHtml: false)
      duration
      season
      startDate { year month day }
      endDate { year month day }
      source(version: 3)
      popularity
      favourites
      siteUrl
      genres
      tags { name rank isGeneralSpoiler isMediaSpoiler isAdult }
      rankings { rank type allTime }
      studios(isMain: true) { nodes { name } }
      trailer { id site }
      nextAiringEpisode { episode airingAt }
      externalLinks { site url type }
      relations {
        edges {
          relationType(version: 2)
          node { id type format title { romaji english } }
        }
      }
      characters(sort: [ROLE, RELEVANCE, ID], perPage: 12) {
        edges {
          role
          node { id name { full } image { medium } }
          voiceActors(language: JAPANESE, sort: [RELEVANCE, ID]) { id name { full } image { medium } }
        }
      }
      recommendations(sort: [RATING_DESC, ID], perPage: 12) {
        nodes { mediaRecommendation { ${CARD_FIELDS} } }
      }
    }
  }
`;

// null замість винятку для 404 — сторінка тайтлу покаже notFound().
export const getAnimeById = cache(async (id: number): Promise<AnimeDetails | null> => {
  try {
    const data = await anilistQuery<{ Media: AniListMediaFull }>(
      DETAILS_QUERY,
      { id },
      { revalidate: REVALIDATE.medium, tags: [`anime:${id}`] },
    );
    return toAnimeDetails(data.Media);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

const GENRES_QUERY = `
  query Genres {
    GenreCollection
    MediaTagCollection { name category isAdult }
  }
`;

export const getGenres = cache(async (): Promise<GenreGroups> => {
  const data = await anilistQuery<{ GenreCollection: string[]; MediaTagCollection: AniListTag[] }>(
    GENRES_QUERY,
    {},
    { revalidate: REVALIDATE.long },
  );
  return toGenreGroups(data.GenreCollection, data.MediaTagCollection);
});
