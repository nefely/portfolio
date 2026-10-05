import type { AnimeCard } from "@/types/anime";
import type { AnimeFilters } from "@/lib/anime/filters";

// AniList шукає лише ЦІЛІ слова: "attack" знаходить, "attac"/"at"/"fri" — ні,
// і префіксного синтаксису (*, %) немає. Поки користувач дописує слово,
// каталог показував би "нічого не знайдено". Тому паралельно з AniList шукаємо
// за префіксом у локальному індексі найпопулярніших тайтлів (див.
// getPrefixIndex у queries.ts). Тут — чисті функції без мережі.

export interface PrefixIndexEntry {
  card: AnimeCard;
  // Кожна назва (англ., ромадзі, синоніми) — як масив слів у нижньому
  // регістрі без діакритики.
  names: string[][];
  // Скільки перших елементів names — основні назви (англ./ромадзі), решта —
  // синоніми. Збіг в основній назві важить більше.
  titleCount: number;
  genres: string[];
  format: string | null;
  status: string | null;
  season: string | null;
  // FuzzyDateInt YYYYMMDD (0 — невідомо): для фільтра за роком і сортування.
  startDate: number;
}

export const MIN_PREFIX_QUERY = 2;

export function tokenize(text: string): string[] {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

// Останнє слово запиту ще набирається — воно може бути префіксом; решта
// мають збігатися зі словом повністю. Інакше короткі токени ("da", "no")
// матчилися б як префікси майже з усім.
function tokenMatches(token: string, word: string, isLast: boolean) {
  return isLast ? word.startsWith(token) : word === token;
}

// Чи йдуть слова запиту поспіль у назві, починаючи з позиції start.
function matchesAt(tokens: string[], name: string[], start: number) {
  return tokens.every((token, i) => {
    const word = name[start + i];
    return word !== undefined && tokenMatches(token, word, i === tokens.length - 1);
  });
}

// 0 — основна назва починається з запиту ("attack on" → Attack on Titan),
// 1 — так починається синонім, 2 — запит є фразою всередині назви,
// 3 — слова розкидані по назвах, null — не збіг.
export function matchRank(
  tokens: string[],
  names: string[][],
  titleCount = names.length,
): 0 | 1 | 2 | 3 | null {
  const startsName = (name: string[]) => matchesAt(tokens, name, 0);
  if (names.slice(0, titleCount).some(startsName)) return 0;
  if (names.slice(titleCount).some(startsName)) return 1;
  if (names.some((name) => name.some((_, start) => matchesAt(tokens, name, start)))) return 2;
  const allWords = names.flat();
  const scattered = tokens.every((token, i) =>
    allWords.some((word) => tokenMatches(token, word, i === tokens.length - 1)),
  );
  return scattered ? 3 : null;
}

const TYPE_FORMATS: Record<string, string[]> = {
  tv: ["TV", "TV_SHORT"],
  movie: ["MOVIE"],
  ova: ["OVA"],
  ona: ["ONA"],
  special: ["SPECIAL"],
  music: ["MUSIC"],
};
const STATUS_MAP: Record<string, string> = {
  airing: "RELEASING",
  complete: "FINISHED",
  upcoming: "NOT_YET_RELEASED",
};

function passesFilters(entry: PrefixIndexEntry, filters: AnimeFilters) {
  if (filters.type && !TYPE_FORMATS[filters.type].includes(entry.format ?? "")) return false;
  if (filters.status && entry.status !== STATUS_MAP[filters.status]) return false;
  if (filters.genres.some((genre) => !entry.genres.includes(genre))) return false;
  if (filters.minScore && (entry.card.score ?? 0) < filters.minScore) return false;
  if (filters.year) {
    if (filters.season) {
      if (entry.card.year !== filters.year || entry.season !== filters.season.toUpperCase()) {
        return false;
      }
    } else if (Math.floor(entry.startDate / 10_000) !== filters.year) {
      return false;
    }
  }
  return true;
}

type Sorter = (a: PrefixIndexEntry, b: PrefixIndexEntry) => number;

const SORTERS: Partial<Record<AnimeFilters["sort"], Sorter>> = {
  score: (a, b) => (b.card.score ?? 0) - (a.card.score ?? 0),
  newest: (a, b) => b.startDate - a.startDate,
  oldest: (a, b) => (a.startDate || Infinity) - (b.startDate || Infinity),
  title: (a, b) => a.card.title.localeCompare(b.card.title),
};

// Індекс уже впорядкований за популярністю. Для сортувань "за релевантністю"
// (popularity/trending/favorites) — спершу якість збігу, далі популярність;
// для явних (оцінка, дата, назва) — як попросив користувач.
// Теги в індексі не зберігаємо — з фільтром за тегами повертаємо null.
export function searchPrefixIndex(
  index: PrefixIndexEntry[],
  filters: AnimeFilters,
  limit: number,
): AnimeCard[] | null {
  const tokens = tokenize(filters.q);
  if (
    filters.q.trim().length < MIN_PREFIX_QUERY ||
    tokens.length === 0 ||
    filters.tags.length > 0
  ) {
    return null;
  }

  const matches: { entry: PrefixIndexEntry; rank: number }[] = [];
  for (const entry of index) {
    const rank = matchRank(tokens, entry.names, entry.titleCount);
    if (rank !== null && passesFilters(entry, filters)) matches.push({ entry, rank });
  }

  const sorter = SORTERS[filters.sort];
  // toSorted стабільний: при рівному rank зберігається порядок популярності.
  const ordered = sorter
    ? matches.toSorted((a, b) => sorter(a.entry, b.entry))
    : matches.toSorted((a, b) => a.rank - b.rank);
  return ordered.slice(0, limit).map(({ entry }) => entry.card);
}
