import { describe, expect, it } from "vitest";
import type { AuditEntry } from "@/types/crm";
import { describeChanges } from "./audit";

const resolve = {
  stage: (id: string) => ({ s1: "Proposal", s2: "Negotiation" })[id],
  person: (id: string) => ({ u1: "Jamie Carter" })[id],
  money: (value: number) => `$${value}`,
};

const entry = (action: AuditEntry["action"], changes: Record<string, unknown>) =>
  ({ action, changes }) as AuditEntry;

describe("describeChanges", () => {
  it("turns ids into names for updates", () => {
    const lines = describeChanges(
      entry("update", {
        stage_id: { old: "s1", new: "s2" },
        value: { old: 1000, new: 2500 },
        owner_id: { old: null, new: "u1" },
      }),
      resolve,
    );
    expect(lines).toEqual([
      { field: "Stage", from: "Proposal", to: "Negotiation" },
      { field: "Value", from: "$1000", to: "$2500" },
      { field: "Owner", from: null, to: "Jamie Carter" },
    ]);
  });

  it("falls back for deleted stages and unknown people", () => {
    const [line] = describeChanges(
      entry("update", { stage_id: { old: "gone", new: "s1" } }),
      resolve,
    );
    expect(line.from).toBe("deleted stage");
  });

  it("summarises inserts by key fields only", () => {
    const lines = describeChanges(
      entry("insert", { id: "x", title: "Acme", stage_id: "s1", value: 500, notes: null }),
      resolve,
    );
    expect(lines.map((line) => line.field)).toEqual(["Stage", "Value"]);
  });
});
