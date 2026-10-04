import { describe, expect, it } from "vitest";
import type { AnimeCard } from "@/types/anime";
import type { Entry } from "@/types/library";
import { applyEntryPatch } from "./entryPatch";

const anime: AnimeCard = {
  id: 1,
  title: "Show",
  image: null,
  score: 8,
  type: "TV",
  episodes: 12,
  year: 2024,
  status: null,
};

function entry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: "e1",
    animeId: 1,
    status: "watching",
    progress: 5,
    score: null,
    isFavorite: false,
    notes: null,
    anime,
    updatedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("applyEntryPatch", () => {
  it("creates a planned entry by default", () => {
    expect(applyEntryPatch(anime, null, {})).toMatchObject({
      animeId: 1,
      status: "planned",
      progress: 0,
    });
  });

  it("fills progress when marked completed", () => {
    expect(applyEntryPatch(anime, entry(), { status: "completed" }).progress).toBe(12);
  });

  it("marks completed when the last episode is reached", () => {
    expect(applyEntryPatch(anime, entry({ progress: 11 }), { progress: 12 }).status).toBe(
      "completed",
    );
  });

  it("moves planned to watching once progress starts", () => {
    expect(
      applyEntryPatch(anime, entry({ status: "planned", progress: 0 }), { progress: 1 }).status,
    ).toBe("watching");
  });

  it("clamps progress to the episode count", () => {
    expect(applyEntryPatch(anime, entry(), { progress: 99 }).progress).toBe(12);
    expect(applyEntryPatch(anime, entry(), { progress: -3 }).progress).toBe(0);
  });

  it("allows any progress when the episode count is unknown", () => {
    const ongoing = { ...anime, episodes: null };
    const result = applyEntryPatch(ongoing, entry({ anime: ongoing }), { progress: 500 });
    expect(result).toMatchObject({ progress: 500, status: "watching" });
  });

  it("keeps other fields when patching one", () => {
    const result = applyEntryPatch(anime, entry({ score: 9, isFavorite: true }), {
      notes: "great",
    });
    expect(result).toMatchObject({ score: 9, isFavorite: true, notes: "great", progress: 5 });
  });
});
