import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, toAniListVariables } from "@/lib/anime/filters";
import { buildSearchQuery } from "./searchQuery";

describe("buildSearchQuery", () => {
  it("declares and passes only the filters that are set (no nulls reach AniList)", () => {
    const { query, variables } = buildSearchQuery(
      toAniListVariables({ ...DEFAULT_FILTERS, q: "frieren", genres: ["Fantasy"] }, 2),
      "id",
    );
    expect(query).toContain("$search: String");
    expect(query).toContain("genre_in: $genres");
    expect(query).not.toContain("$tags");
    expect(query).not.toContain("averageScore_greater");
    expect(variables).toEqual({
      page: 2,
      perPage: 24,
      sort: ["SEARCH_MATCH"],
      search: "frieren",
      genres: ["Fantasy"],
    });
    expect(Object.values(variables)).not.toContain(null);
  });

  it("always filters out adult titles", () => {
    expect(buildSearchQuery(toAniListVariables(DEFAULT_FILTERS, 1), "id").query).toContain(
      "isAdult: false",
    );
  });

  it("produces identical queries for identical filters (stable cache key)", () => {
    const a = buildSearchQuery(toAniListVariables({ ...DEFAULT_FILTERS, year: 2020 }, 1), "id");
    const b = buildSearchQuery(toAniListVariables({ ...DEFAULT_FILTERS, year: 2020 }, 1), "id");
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
