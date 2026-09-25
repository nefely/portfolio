import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safeNextPath";

describe("safeNextPath", () => {
  it("keeps internal paths", () => {
    expect(safeNextPath("/uk/account", "/fallback")).toBe("/uk/account");
    expect(safeNextPath("/en/jobs?category=it", "/fallback")).toBe("/en/jobs?category=it");
  });

  it("falls back for missing or non-string values", () => {
    expect(safeNextPath(undefined, "/fallback")).toBe("/fallback");
    expect(safeNextPath("", "/fallback")).toBe("/fallback");
    expect(safeNextPath(["/a", "/b"], "/fallback")).toBe("/fallback");
  });

  it("rejects absolute and protocol-relative URLs (open redirect)", () => {
    expect(safeNextPath("https://evil.com", "/fallback")).toBe("/fallback");
    expect(safeNextPath("//evil.com", "/fallback")).toBe("/fallback");
    expect(safeNextPath("/\\evil.com", "/fallback")).toBe("/fallback");
    expect(safeNextPath("javascript:alert(1)", "/fallback")).toBe("/fallback");
  });
});
