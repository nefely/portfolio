import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS } from "@/lib/anime/filters";
import { matchRank, searchPrefixIndex, tokenize, type PrefixIndexEntry } from "./prefixSearch";

function entry(
  id: number,
  names: string[],
  extra: Partial<PrefixIndexEntry> = {},
): PrefixIndexEntry {
  return {
    card: {
      id,
      title: names[0],
      image: null,
      score: 8,
      type: "TV",
      episodes: 12,
      year: 2020,
      status: "Finished",
    },
    names: names.map(tokenize),
    // Перша назва — основна, решта — синоніми.
    titleCount: 1,
    genres: ["Action"],
    format: "TV",
    status: "FINISHED",
    season: "SPRING",
    startDate: 20200401,
    ...extra,
  };
}

// Порядок = популярність (як в індексі).
const INDEX = [
  entry(1, ["Attack on Titan", "Shingeki no Kyojin"]),
  entry(2, ["Demon Slayer: Kimetsu no Yaiba"], { format: "MOVIE", startDate: 20201016 }),
  entry(3, ["Frieren: Beyond Journey's End", "Sousou no Frieren"], {
    card: { ...entry(3, ["x"]).card, title: "Frieren", score: 9.1 },
  }),
  entry(4, ["One-Punch Man"]),
  entry(5, ["ONE PIECE"]),
  entry(6, ["Re:ZERO -Starting Life in Another World-"]),
  entry(7, ["DAN DA DAN"]),
  entry(8, ["A Silent Voice", "Koe no Katachi", "Dan dan kokoro"]),
];

function search(q: string, extra = {}) {
  const result = searchPrefixIndex(INDEX, { ...DEFAULT_FILTERS, q, ...extra }, 24);
  return result && result.map((card) => card.id);
}

describe("tokenize", () => {
  it("lowercases, strips punctuation and diacritics", () => {
    expect(tokenize("Re:ZERO -Starting Life-")).toEqual(["re", "zero", "starting", "life"]);
    expect(tokenize("Pokémon")).toEqual(["pokemon"]);
  });
});

describe("matchRank", () => {
  const names = [tokenize("Attack on Titan"), tokenize("Shingeki no Kyojin")];

  it("ranks a title that starts with the query highest", () => {
    expect(matchRank(["attack", "on"], names)).toBe(0);
  });

  it("ranks a synonym start below a main-title start", () => {
    expect(matchRank(["shingeki"], names, 1)).toBe(1);
    expect(matchRank(["shingeki"], names, 2)).toBe(0);
  });

  it("ranks a phrase inside a title next", () => {
    expect(matchRank(["on", "ti"], names)).toBe(2);
  });

  it("accepts scattered words last and rejects non-matches", () => {
    expect(matchRank(["titan", "shingeki"], names)).toBe(3);
    expect(matchRank(["naruto"], names)).toBeNull();
  });

  it("treats only the last token as a prefix", () => {
    expect(matchRank(["att"], names)).toBe(0);
    expect(matchRank(["att", "on"], names)).toBeNull();
  });
});

describe("searchPrefixIndex", () => {
  it("finds titles while the word is still being typed", () => {
    expect(search("at")).toEqual([1]);
    expect(search("fri")).toEqual([3]);
    expect(search("one p")).toEqual([4, 5]);
    expect(search("re ze")).toEqual([6]);
  });

  it("puts exact title-start matches before scattered ones", () => {
    expect(search("dan da dan")).toEqual([7]);
    expect(search("dan")).toEqual([7, 8]);
  });

  it("applies catalog filters", () => {
    expect(search("demon", { type: "tv" })).toEqual([]);
    expect(search("demon", { type: "movie" })).toEqual([2]);
    expect(search("fri", { minScore: 9 })).toEqual([3]);
    expect(search("at", { year: 2019 })).toEqual([]);
  });

  it("honours explicit sorts", () => {
    expect(search("o", { sort: "title" })).toBeNull(); // too short
    expect(search("on", { sort: "title" })).toEqual([1, 5, 4]); // Attack…, ONE PIECE, One-Punch…
  });

  it("returns null when not applicable", () => {
    expect(search("a")).toBeNull();
    expect(search("attack", { tags: ["Military"] })).toBeNull();
  });
});
