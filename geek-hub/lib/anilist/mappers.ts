import type {
  AnimeCard,
  AnimeCharacter,
  AnimeDetails,
  AnimePage,
  AnimeRelation,
  GenreGroups,
} from "@/types/anime";
import type {
  AniListFuzzyDate,
  AniListMediaCard,
  AniListMediaFull,
  AniListPage,
  AniListTag,
  AniListTitle,
} from "./types";

const FORMAT_LABELS: Record<string, string> = {
  TV: "TV",
  TV_SHORT: "TV Short",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
  MANGA: "Manga",
  NOVEL: "Light Novel",
  ONE_SHOT: "One Shot",
};

const STATUS_LABELS: Record<string, string> = {
  FINISHED: "Finished",
  RELEASING: "Airing",
  NOT_YET_RELEASED: "Upcoming",
  CANCELLED: "Cancelled",
  HIATUS: "On hiatus",
};

// ENUM_VALUE → "Enum value" для полів, яким не потрібен окремий словник.
export function humanizeEnum(value: string | null | undefined) {
  if (!value) return null;
  const words = value.toLowerCase().replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export const formatLabel = (format: string | null) =>
  format ? (FORMAT_LABELS[format] ?? humanizeEnum(format)) : null;
export const statusLabel = (status: string | null) =>
  status ? (STATUS_LABELS[status] ?? humanizeEnum(status)) : null;

// Англійська назва є не в усіх тайтлів — тоді ромадзі.
export function displayTitle(title: AniListTitle) {
  return title.english?.trim() || title.romaji?.trim() || title.native?.trim() || "Untitled";
}

export const toTenScale = (score: number | null) =>
  score === null || score === 0 ? null : score / 10;

export function toAnimeCard(media: AniListMediaCard): AnimeCard {
  return {
    id: media.id,
    title: displayTitle(media.title),
    image: media.coverImage?.large ?? null,
    color: media.coverImage?.color ?? null,
    score: toTenScale(media.averageScore),
    type: formatLabel(media.format),
    episodes: media.episodes,
    year: media.seasonYear ?? media.startDate?.year ?? null,
    status: statusLabel(media.status),
  };
}

// Сторінки AniList можуть "з'їжджати", поки список змінюється (новий
// тренд між запитами) — дублікати ламають React key і псують сітку.
export function uniqueById<T extends { id: number }>(items: T[], seen = new Set<number>()): T[] {
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function toAnimePage(page: AniListPage): AnimePage {
  return {
    items: uniqueById(page.media.map(toAnimeCard)),
    page: page.pageInfo.currentPage,
    hasNextPage: page.pageInfo.hasNextPage,
    total: page.pageInfo.total,
  };
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&quot;": '"',
  "&#039;": "'",
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&mdash;": "—",
  "&nbsp;": " ",
};

// Опис в AniList — HTML (<br>, <i>, <b>). Рендеримо як текст: так немає
// dangerouslySetInnerHTML і ризику XSS з чужого контенту.
export function cleanDescription(description: string | null) {
  if (!description) return null;
  const text = description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/gi, (entity) => HTML_ENTITIES[entity] ?? entity)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text || null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatFuzzyDate(date: AniListFuzzyDate | null | undefined) {
  if (!date?.year) return null;
  return [date.month ? MONTHS[date.month - 1] : null, date.day, date.year]
    .filter(Boolean)
    .join(" ")
    .replace(/ (\d+) /, " $1, ");
}

function airedRange(media: AniListMediaFull) {
  const start = formatFuzzyDate(media.startDate);
  if (!start) return null;
  if (media.status === "RELEASING") return `${start} – now`;
  const end = formatFuzzyDate(media.endDate);
  return end && end !== start ? `${start} – ${end}` : start;
}

function toRelation(edge: AniListMediaFull["relations"]["edges"][number]): AnimeRelation {
  return {
    id: edge.node.id,
    relation: humanizeEnum(edge.relationType) ?? "Related",
    title: displayTitle(edge.node.title),
    format: formatLabel(edge.node.format),
    isAnime: edge.node.type === "ANIME",
  };
}

function toCharacter(edge: AniListMediaFull["characters"]["edges"][number]): AnimeCharacter {
  const va = edge.voiceActors[0];
  return {
    id: edge.node.id,
    name: edge.node.name.full,
    image: edge.node.image.medium,
    role: humanizeEnum(edge.role) ?? "",
    voiceActor: va ? { id: va.id, name: va.name.full, image: va.image.medium } : null,
  };
}

export function toAnimeDetails(media: AniListMediaFull): AnimeDetails {
  return {
    ...toAnimeCard(media),
    titleRomaji: media.title.romaji ?? displayTitle(media.title),
    titleNative: media.title.native ?? null,
    imageLarge: media.coverImage?.extraLarge ?? media.coverImage?.large ?? null,
    banner: media.bannerImage,
    synopsis: cleanDescription(media.description),
    source: humanizeEnum(media.source),
    duration: media.duration,
    season: humanizeEnum(media.season),
    aired: airedRange(media),
    nextEpisode: media.nextAiringEpisode,
    popularity: media.popularity,
    favorites: media.favourites,
    rankRated:
      media.rankings.find((ranking) => ranking.type === "RATED" && ranking.allTime)?.rank ?? null,
    rankPopular:
      media.rankings.find((ranking) => ranking.type === "POPULAR" && ranking.allTime)?.rank ?? null,
    trailerYoutubeId: media.trailer?.site === "youtube" ? media.trailer.id : null,
    studios: media.studios.nodes.map((studio) => studio.name),
    genres: media.genres.filter((genre) => genre !== "Hentai"),
    tags: media.tags
      .filter((tag) => !tag.isAdult)
      .map((tag) => ({
        name: tag.name,
        rank: tag.rank,
        isSpoiler: tag.isGeneralSpoiler || tag.isMediaSpoiler,
      })),
    relations: media.relations.edges.map(toRelation),
    streaming: media.externalLinks
      .filter((link) => link.type === "STREAMING")
      .map((link) => ({ name: link.site, url: link.url })),
    characters: media.characters.edges.map(toCharacter),
    recommendations: uniqueById(
      media.recommendations.nodes
        .map((node) => node.mediaRecommendation)
        .filter((rec): rec is AniListMediaCard => rec !== null)
        .map(toAnimeCard),
    ),
    malId: media.idMal,
    siteUrl: media.siteUrl,
  };
}

// Теги AniList згруповані категоріями ("Theme-Fantasy", "Setting-Scene", ...).
// Для фільтрів беремо осмислені групи й відкидаємо 18+ та службові.
export function toGenreGroups(genres: string[], tags: AniListTag[]): GenreGroups {
  const safeTags = tags.filter((tag) => !tag.isAdult);
  const byPrefix = (prefix: string) =>
    safeTags
      .filter((tag) => tag.category.startsWith(prefix))
      .map((tag) => tag.name)
      .sort((a, b) => a.localeCompare(b));

  return {
    genres: genres.filter((genre) => genre !== "Hentai"),
    themes: byPrefix("Theme"),
    settings: byPrefix("Setting"),
    demographics: byPrefix("Demographic"),
  };
}
