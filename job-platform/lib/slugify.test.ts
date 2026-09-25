import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "./slugify";

describe("slugify", () => {
  it("transliterates Ukrainian names", () => {
    expect(slugify("Олена Коваленко")).toBe("olena-kovalenko");
    expect(slugify("Юрій Щербак")).toBe("yuriy-shcherbak");
  });

  it("transliterates Polish letters", () => {
    expect(slugify("Łukasz Żółć")).toBe("lukasz-zolc");
  });

  it("collapses punctuation and trims dashes", () => {
    expect(slugify("  BuildPro -- Europe!  ")).toBe("buildpro-europe");
  });

  it("returns an empty string when nothing transliterable is left", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("uniqueSlug", () => {
  it("appends the suffix", () => {
    expect(uniqueSlug("Олена Коваленко", "candidate", "a1b2c3")).toBe("olena-kovalenko-a1b2c3");
  });

  it("uses the fallback base for empty slugs", () => {
    expect(uniqueSlug("!!!", "candidate", "a1b2c3")).toBe("candidate-a1b2c3");
  });

  it("generates a random 6-char suffix by default", () => {
    expect(uniqueSlug("Olena", "candidate")).toMatch(/^olena-[0-9a-f]{6}$/);
  });
});
