import "server-only";

import { cache } from "react";
import type { AnimeCard, AnimeDetails, AnimePage, GenreGroups } from "@/types/anime";
import { toAniListVariables, type AnimeFilters } from "@/lib/anime/filters";
import { ApiError } from "@/lib/api/retry";
import { anilistQuery, REVALIDATE } from "./client";
import { toAnimeCard, toAnimeDetails, toAnimePage, toGenreGroups, uniqueById } from "./mappers";
import { buildSearchQuery } from "./searchQuery";
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
  const data = await anilistQuery<{ Page: AniListPage }>(query, variables, {
    revalidate: REVALIDATE.short,
  });
  return toAnimePage(data.Page);
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
