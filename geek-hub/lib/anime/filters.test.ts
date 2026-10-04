import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTERS,
  countActiveFilters,
  parseFilters,
  serializeFilters,
  toAniListVariables,
} from "./filters";

describe("parseFilters", () => {
  it("returns defaults for empty params", () => {
    expect(parseFilters(new URLSearchParams())).toEqual(DEFAULT_FILTERS);
  });

  it("parses valid params from a Next.js searchParams record", () => {
    const filters = parseFilters({
      q: "  frieren ",
      genres: "Fantasy,Adventure",
      tags: "Elf",
      type: "tv",
      year: "2023",
      season: "fall",
      sort: "score",
    });
    expect(filters).toMatchObject({
      q: "frieren",
      genres: ["Adventure", "Fantasy"],
      tags: ["Elf"],
      type: "tv",
      year: 2023,
      season: "fall",
      sort: "score",
    });
  });

  it("keeps names with spaces and hyphens", () => {
    expect(parseFilters(new URLSearchParams("genres=Slice of Life,Sci-Fi")).genres).toEqual([
      "Sci-Fi",
      "Slice of Life",
    ]);
  });

  it("silently drops invalid values instead of throwing", () => {
    const filters = parseFilters(
      new URLSearchParams(
        "type=netflix&status=x&year=1800&minScore=12&sort=random&genres=<script>,Drama",
      ),
    );
    expect(filters).toMatchObject({
      type: null,
      status: null,
      year: null,
      minScore: null,
      sort: "popularity",
      genres: ["Drama"],
    });
  });

  it("dedupes and sorts names so equivalent URLs share a cache key", () => {
    const a = parseFilters(new URLSearchParams("genres=Drama,Action,Action"));
    const b = parseFilters(new URLSearchParams("genres=Action,Drama"));
    expect(serializeFilters(a)).toBe(serializeFilters(b));
  });
});

describe("serializeFilters", () => {
  it("omits defaults", () => {
    expect(serializeFilters(DEFAULT_FILTERS)).toBe("");
  });

  it("round-trips through parseFilters", () => {
    const filters = {
      ...DEFAULT_FILTERS,
      q: "one piece",
      genres: ["Action", "Comedy"],
      tags: ["Pirates"],
      status: "airing" as const,
      minScore: 7,
      sort: "trending" as const,
    };
    expect(parseFilters(new URLSearchParams(serializeFilters(filters)))).toEqual(filters);
  });
});

describe("toAniListVariables", () => {
  it("passes nulls for unset filters and a fixed page size", () => {
    expect(toAniListVariables(DEFAULT_FILTERS, 3)).toMatchObject({
      page: 3,
      perPage: 24,
      search: null,
      genres: null,
      tags: null,
      formats: null,
      status: null,
      season: null,
      minScore: null,
      sort: ["POPULARITY_DESC"],
    });
  });

  it("sorts search results by relevance unless another sort was chosen", () => {
    expect(toAniListVariables({ ...DEFAULT_FILTERS, q: "naruto" }, 1).sort).toEqual([
      "SEARCH_MATCH",
    ]);
    expect(toAniListVariables({ ...DEFAULT_FILTERS, q: "naruto", sort: "score" }, 1).sort).toEqual([
      "SCORE_DESC",
    ]);
  });

  it("uses season + seasonYear when both are set", () => {
    expect(
      toAniListVariables({ ...DEFAULT_FILTERS, year: 2024, season: "spring" }, 1),
    ).toMatchObject({
      season: "SPRING",
      seasonYear: 2024,
      startFrom: null,
      startTo: null,
    });
  });

  it("uses a start date range for a year without season", () => {
    expect(toAniListVariables({ ...DEFAULT_FILTERS, year: 2010 }, 1)).toMatchObject({
      season: null,
      startFrom: 20100000,
      startTo: 20110000,
    });
  });

  it("ignores season without a year", () => {
    expect(toAniListVariables({ ...DEFAULT_FILTERS, season: "winter" }, 1).season).toBeNull();
  });

  it("maps the type to AniList formats and status to AniList enums", () => {
    expect(
      toAniListVariables({ ...DEFAULT_FILTERS, type: "tv", status: "upcoming" }, 1),
    ).toMatchObject({
      formats: ["TV", "TV_SHORT"],
      status: "NOT_YET_RELEASED",
    });
  });

  it("converts minScore to AniList's 0–100 scale (inclusive)", () => {
    expect(toAniListVariables({ ...DEFAULT_FILTERS, minScore: 8 }, 1).minScore).toBe(79);
  });
});

describe("countActiveFilters", () => {
  it("counts every genre, tag and set filter but not the search query or sort", () => {
    expect(
      countActiveFilters({
        ...DEFAULT_FILTERS,
        q: "x",
        sort: "score",
        genres: ["Action", "Drama"],
        tags: ["Isekai"],
        type: "movie",
        year: 2020,
      }),
    ).toBe(5);
  });
});
