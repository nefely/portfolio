import { describe, expect, it } from "vitest";
import { POSITION_STEP, positionAt, positionBetween } from "./position";

describe("positionBetween", () => {
  it("starts an empty column at one step", () => {
    expect(positionBetween(undefined, undefined)).toBe(POSITION_STEP);
  });

  it("goes before the first card and after the last one", () => {
    expect(positionBetween(undefined, 3000)).toBe(2000);
    expect(positionBetween(3000, undefined)).toBe(4000);
  });

  it("takes the midpoint between neighbours", () => {
    expect(positionBetween(1000, 2000)).toBe(1500);
  });

  it("keeps order across many inserts into the same gap", () => {
    let low = 1000;
    const high = 2000;
    for (let i = 0; i < 40; i++) {
      const next = positionBetween(low, high);
      expect(next).toBeGreaterThan(low);
      expect(next).toBeLessThan(high);
      low = next;
    }
  });
});

describe("positionAt", () => {
  const column = [1000, 2000, 3000];

  it("inserts at the top, middle and bottom", () => {
    expect(positionAt(column, 0)).toBe(0);
    expect(positionAt(column, 1)).toBe(1500);
    expect(positionAt(column, 3)).toBe(4000);
  });

  it("handles an empty column", () => {
    expect(positionAt([], 0)).toBe(POSITION_STEP);
  });
});
