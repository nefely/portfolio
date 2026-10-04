// Сирі відповіді AniList GraphQL (https://docs.anilist.co). Описуємо лише
// поля, які запитуємо у lib/anilist/queries.ts.

export interface AniListTitle {
  romaji: string | null;
  english: string | null;
  native?: string | null;
}

export interface AniListFuzzyDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface AniListMediaCard {
  id: number;
  title: AniListTitle;
  coverImage: { large: string | null; extraLarge?: string | null; color: string | null } | null;
  format: string | null;
  episodes: number | null;
  seasonYear: number | null;
  startDate?: AniListFuzzyDate | null;
  status: string | null;
  averageScore: number | null;
}

export interface AniListPageInfo {
  total: number | null;
  currentPage: number;
  hasNextPage: boolean;
}

export interface AniListPage {
  pageInfo: AniListPageInfo;
  media: AniListMediaCard[];
}

export interface AniListMediaFull extends AniListMediaCard {
  idMal: number | null;
  bannerImage: string | null;
  description: string | null;
  duration: number | null;
  season: string | null;
  endDate: AniListFuzzyDate | null;
  source: string | null;
  popularity: number | null;
  favourites: number | null;
  siteUrl: string;
  genres: string[];
  tags: {
    name: string;
    rank: number;
    isGeneralSpoiler: boolean;
    isMediaSpoiler: boolean;
    isAdult: boolean;
  }[];
  rankings: { rank: number; type: "RATED" | "POPULAR"; allTime: boolean }[];
  studios: { nodes: { name: string }[] };
  trailer: { id: string; site: string } | null;
  nextAiringEpisode: { episode: number; airingAt: number } | null;
  externalLinks: { site: string; url: string; type: string }[];
  relations: {
    edges: {
      relationType: string;
      node: { id: number; type: "ANIME" | "MANGA"; format: string | null; title: AniListTitle };
    }[];
  };
  characters: {
    edges: {
      role: string;
      node: { id: number; name: { full: string }; image: { medium: string | null } };
      voiceActors: { id: number; name: { full: string }; image: { medium: string | null } }[];
    }[];
  };
  recommendations: {
    nodes: { mediaRecommendation: AniListMediaCard | null }[];
  };
}

export interface AniListTag {
  name: string;
  category: string;
  isAdult: boolean;
}
