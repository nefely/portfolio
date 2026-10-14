import { describe, expect, it } from "vitest";
import type { DealRow, Stage } from "@/types/crm";
import { buildColumns, findColumn, moveAcross, positionInColumn, reorderWithin } from "./board";

const stage = (id: string, position: number): Stage => ({
  id,
  name: id,
  position,
  probability: 10,
  kind: "open",
  color: "#000000",
});

const deal = (id: string, stage_id: string, position: number) =>
  ({ id, stage_id, position }) as DealRow;

const stages = [stage("lead", 1), stage("won", 2)];

describe("buildColumns", () => {
  it("groups deals by stage, sorted by position", () => {
    const columns = buildColumns(
      [deal("b", "lead", 2000), deal("a", "lead", 1000), deal("c", "won", 1)],
      stages,
    );
    expect(columns).toEqual({ lead: ["a", "b"], won: ["c"] });
  });

  it("keeps empty columns and ignores unknown stages", () => {
    expect(buildColumns([deal("x", "gone", 1)], stages)).toEqual({ lead: [], won: [] });
  });
});

describe("findColumn", () => {
  const columns = { lead: ["a"], won: [] };
  it("finds by card id or by column id", () => {
    expect(findColumn(columns, "a")).toBe("lead");
    expect(findColumn(columns, "won")).toBe("won");
    expect(findColumn(columns, "nope")).toBeUndefined();
  });
});

describe("moveAcross", () => {
  const columns = { lead: ["a", "b"], won: ["c", "d"] };

  it("drops before the hovered card in another column", () => {
    expect(moveAcross(columns, "a", "d")).toEqual({ lead: ["b"], won: ["c", "a", "d"] });
  });

  it("drops at the end when hovering the column itself", () => {
    expect(moveAcross(columns, "a", "won")).toEqual({ lead: ["b"], won: ["c", "d", "a"] });
  });

  it("does nothing inside the same column", () => {
    expect(moveAcross(columns, "a", "b")).toBe(columns);
  });
});

describe("reorderWithin", () => {
  it("moves a card down and up", () => {
    const columns = { lead: ["a", "b", "c"] };
    expect(reorderWithin(columns, "a", "c").lead).toEqual(["b", "c", "a"]);
    expect(reorderWithin(columns, "c", "a").lead).toEqual(["c", "a", "b"]);
  });
});

describe("positionInColumn", () => {
  const positions = new Map([
    ["a", 1000],
    ["b", 2000],
    ["x", 99999],
  ]);

  it("lands between neighbours", () => {
    expect(positionInColumn(["a", "x", "b"], "x", positions)).toBe(1500);
  });

  it("lands before the first and after the last", () => {
    expect(positionInColumn(["x", "a", "b"], "x", positions)).toBe(0);
    expect(positionInColumn(["a", "b", "x"], "x", positions)).toBe(3000);
  });
});
