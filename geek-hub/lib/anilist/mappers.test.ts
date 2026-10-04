import { describe, expect, it } from "vitest";
import {
  cleanDescription,
  displayTitle,
  formatFuzzyDate,
  humanizeEnum,
  toAnimeCard,
  toAnimePage,
  toGenreGroups,
  uniqueById,
} from "./mappers";
import type { AniListMediaCard } from "./types";

const media: AniListMediaCard = {
  id: 154587,
  title: { romaji: "Sousou no Frieren", english: "Frieren: Beyond Journey's End" },
  coverImage: { large: "https://s4.anilist.co/cover.jpg", color: "#e4ae5d" },
  format: "TV",
  episodes: 28,
  seasonYear: 2023,
  startDate: { year: 2023, month: 9, day: 29 },
  status: "FINISHED",
  averageScore: 91,
};

describe("displayTitle", () => {
  it("prefers English, then romaji, then native", () => {
    expect(displayTitle({ romaji: "Gintama", english: "Gin Tama" })).toBe("Gin Tama");
    expect(displayTitle({ romaji: "Gintama", english: "  " })).toBe("Gintama");
    expect(displayTitle({ romaji: null, english: null, native: "銀魂" })).toBe("銀魂");
  });
});

describe("toAnimeCard", () => {
  it("maps to the slim card with a 0–10 score and readable labels", () => {
    expect(toAnimeCard(media)).toEqual({
      id: 154587,
      title: "Frieren: Beyond Journey's End",
      image: "https://s4.anilist.co/cover.jpg",
      color: "#e4ae5d",
      score: 9.1,
      type: "TV",
      episodes: 28,
      year: 2023,
      status: "Finished",
    });
  });

  it("treats a 0 score as unrated and falls back to the start year", () => {
    const card = toAnimeCard({ ...media, averageScore: 0, seasonYear: null, format: "TV_SHORT" });
    expect(card).toMatchObject({ score: null, year: 2023, type: "TV Short" });
  });
});

describe("toAnimePage", () => {
  it("dedupes media and exposes pagination", () => {
    const page = toAnimePage({
      pageInfo: { total: 5000, currentPage: 2, hasNextPage: true },
      media: [media, media],
    });
    expect(page).toMatchObject({ page: 2, hasNextPage: true, total: 5000 });
    expect(page.items).toHaveLength(1);
  });
});

describe("uniqueById", () => {
  it("keeps the first occurrence", () => {
    expect(
      uniqueById([
        { id: 1, n: "a" },
        { id: 1, n: "b" },
      ]),
    ).toEqual([{ id: 1, n: "a" }]);
  });
});

describe("cleanDescription", () => {
  it("turns AniList HTML into plain text", () => {
    expect(cleanDescription("Line one<br><br>\n<i>Line &amp; two</i>")).toBe(
      "Line one\n\nLine & two",
    );
  });

  it("returns null for empty input", () => {
    expect(cleanDescription(null)).toBeNull();
    expect(cleanDescription("<br>")).toBeNull();
  });
});

describe("formatFuzzyDate", () => {
  it("formats partial dates", () => {
    expect(formatFuzzyDate({ year: 2023, month: 9, day: 29 })).toBe("Sep 29, 2023");
    expect(formatFuzzyDate({ year: 2023, month: 9, day: null })).toBe("Sep 2023");
    expect(formatFuzzyDate({ year: 2023, month: null, day: null })).toBe("2023");
    expect(formatFuzzyDate({ year: null, month: 1, day: 1 })).toBeNull();
  });
});

describe("humanizeEnum", () => {
  it("makes enum values readable", () => {
    expect(humanizeEnum("LIGHT_NOVEL")).toBe("Light novel");
    expect(humanizeEnum(null)).toBeNull();
  });
});

describe("toGenreGroups", () => {
  it("drops adult content and groups tags by category", () => {
    const groups = toGenreGroups(
      ["Action", "Hentai", "Drama"],
      [
        { name: "Isekai", category: "Theme-Fantasy", isAdult: false },
        { name: "School", category: "Setting-Scene", isAdult: false },
        { name: "Shounen", category: "Demographic", isAdult: false },
        { name: "Nudity", category: "Sexual Content", isAdult: true },
        { name: "Primarily Female Cast", category: "Cast-Main Cast", isAdult: false },
      ],
    );
    expect(groups).toEqual({
      genres: ["Action", "Drama"],
      themes: ["Isekai"],
      settings: ["School"],
      demographics: ["Shounen"],
    });
  });
});
