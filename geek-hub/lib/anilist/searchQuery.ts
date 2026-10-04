import type { AniListSearchVariables } from "@/lib/anime/filters";

// Змінна → [GraphQL-тип, аргумент media(...)].
const FILTER_ARGS = {
  search: ["String", "search"],
  genres: ["[String]", "genre_in"],
  tags: ["[String]", "tag_in"],
  formats: ["[MediaFormat]", "format_in"],
  status: ["MediaStatus", "status"],
  season: ["MediaSeason", "season"],
  seasonYear: ["Int", "seasonYear"],
  startFrom: ["FuzzyDateInt", "startDate_greater"],
  startTo: ["FuzzyDateInt", "startDate_lesser"],
  minScore: ["Int", "averageScore_greater"],
} as const satisfies Partial<Record<keyof AniListSearchVariables, readonly [string, string]>>;

type FilterKey = keyof typeof FILTER_ARGS;

// AniList відхиляє частину аргументів зі значенням null ("Illegal operator
// and value combination"), тож запит збираємо лише з тих фільтрів, що
// реально задані. Побічний плюс: однакові фільтри дають однаковий текст
// запиту — і той самий ключ у Data Cache.
export function buildSearchQuery(variables: AniListSearchVariables, cardFields: string) {
  const used = (Object.keys(FILTER_ARGS) as FilterKey[]).filter((key) => variables[key] !== null);

  const declarations = [
    "$page: Int",
    "$perPage: Int",
    "$sort: [MediaSort]",
    ...used.map((key) => `$${key}: ${FILTER_ARGS[key][0]}`),
  ].join(", ");
  const args = [
    "type: ANIME",
    "isAdult: false",
    "sort: $sort",
    ...used.map((key) => `${FILTER_ARGS[key][1]}: $${key}`),
  ].join(", ");

  const query = `query Search(${declarations}) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage hasNextPage }
      media(${args}) { ${cardFields} }
    }
  }`;

  const usedVariables = Object.fromEntries(used.map((key) => [key, variables[key]]));
  return {
    query,
    variables: {
      page: variables.page,
      perPage: variables.perPage,
      sort: variables.sort,
      ...usedVariables,
    },
  };
}
