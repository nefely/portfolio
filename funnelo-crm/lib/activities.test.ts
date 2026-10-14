import { describe, expect, it } from "vitest";
import type { ActivityRow } from "@/types/crm";
import { groupByDue } from "./activities";

const at = (id: string, due: Date | null) =>
  ({ id, due_at: due?.toISOString() ?? null }) as ActivityRow;

describe("groupByDue", () => {
  // 14 жовтня, 12:00 за локальним часом.
  const now = new Date(2026, 9, 14, 12, 0).getTime();

  it("splits by local day boundaries", () => {
    const groups = groupByDue(
      [
        at("yesterday", new Date(2026, 9, 13, 18, 0)),
        at("this-morning", new Date(2026, 9, 14, 9, 0)),
        at("tonight", new Date(2026, 9, 14, 21, 0)),
        at("tomorrow", new Date(2026, 9, 15, 9, 0)),
        at("no-date", null),
      ],
      now,
    );
    expect(groups.overdue.map((a) => a.id)).toEqual(["yesterday"]);
    // Сьогоднішнє, навіть якщо година вже минула, — у "Today", а не "Overdue".
    expect(groups.today.map((a) => a.id)).toEqual(["this-morning", "tonight"]);
    expect(groups.upcoming.map((a) => a.id)).toEqual(["tomorrow"]);
    expect(groups.someday.map((a) => a.id)).toEqual(["no-date"]);
  });
});
