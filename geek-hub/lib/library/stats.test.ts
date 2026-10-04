import { describe, expect, it } from "vitest";
import type { Entry } from "@/types/library";
import { computeStats, filterEntries } from "./stats";

function entry(animeId: number, overrides: Partial<Entry> = {}): Entry {
  return {
    id: `e${animeId}`,
    animeId,
    status: "watching",
    progress: 0,
    score: null,
    isFavorite: false,
    notes: null,
    anime: {
      id: animeId,
      title: `Title ${animeId}`,
      image: null,
      score: null,
      type: "TV",
      episodes: 10,
      year: 2024,
      status: null,
    },
    updatedAt: `2024-01-0${animeId}T00:00:00Z`,
    ...overrides,
  };
}

const entries = [
  entry(1, {
    status: "completed",
    progress: 10,
    score: 8,
    isFavorite: true,
    anime: { ...entry(1).anime, title: "Bleach" },
  }),
  entry(2, {
    status: "watching",
    progress: 4,
    score: 6,
    anime: { ...entry(2).anime, title: "Akira" },
  }),
  entry(3, { status: "planned", anime: { ...entry(3).anime, title: "Cowboy Bebop" } }),
];

describe("computeStats", () => {
  it("aggregates counts, episodes and mean score in one pass", () => {
    expect(computeStats(entries)).toEqual({
      total: 3,
      byStatus: { watching: 1, completed: 1, planned: 1, on_hold: 0, dropped: 0 },
      episodesWatched: 14,
      meanScore: 7,
      favorites: 1,
    });
  });

  it("returns null mean score when nothing is scored", () => {
    expect(computeStats([entry(1)]).meanScore).toBeNull();
  });
});

describe("filterEntries", () => {
  it("filters by status", () => {
    expect(
      filterEntries(entries, { status: "planned", search: "", sort: "recent" }).map(
        (e) => e.animeId,
      ),
    ).toEqual([3]);
  });

  it("filters favorites", () => {
    expect(
      filterEntries(entries, { status: "favorites", search: "", sort: "recent" }).map(
        (e) => e.animeId,
      ),
    ).toEqual([1]);
  });

  it("searches titles case-insensitively", () => {
    expect(
      filterEntries(entries, { status: "all", search: "BEBOP", sort: "recent" }).map(
        (e) => e.animeId,
      ),
    ).toEqual([3]);
  });

  it("sorts by title, score and recency", () => {
    expect(
      filterEntries(entries, { status: "all", search: "", sort: "title" }).map((e) => e.animeId),
    ).toEqual([2, 1, 3]);
    expect(
      filterEntries(entries, { status: "all", search: "", sort: "score" }).map((e) => e.animeId),
    ).toEqual([1, 2, 3]);
    expect(
      filterEntries(entries, { status: "all", search: "", sort: "recent" }).map((e) => e.animeId),
    ).toEqual([3, 2, 1]);
  });

  it("does not mutate the input array", () => {
    const copy = [...entries];
    filterEntries(entries, { status: "all", search: "", sort: "title" });
    expect(entries).toEqual(copy);
  });
});
