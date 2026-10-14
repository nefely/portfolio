import type { Stage } from "@/types/crm";
import { type Db, unwrap } from "./shared";

const STAGE_COLUMNS = "id, name, position, probability, kind, color";

export async function fetchStages(db: Db) {
  return unwrap<Stage[]>(
    await db.from("funnelo_pipeline_stages").select(STAGE_COLUMNS).order("position"),
  );
}

export type StageInput = Pick<Stage, "name" | "probability" | "color">;

export async function createStage(db: Db, input: StageInput, position: number) {
  return unwrap<Stage>(
    await db
      .from("funnelo_pipeline_stages")
      .insert({ ...input, position, kind: "open" })
      .select(STAGE_COLUMNS)
      .single(),
  );
}

export async function updateStage(db: Db, id: string, patch: Partial<StageInput>) {
  return unwrap<Stage>(
    await db
      .from("funnelo_pipeline_stages")
      .update(patch)
      .eq("id", id)
      .select(STAGE_COLUMNS)
      .single(),
  );
}

export async function deleteStage(db: Db, id: string) {
  const { error, count } = await db
    .from("funnelo_deals")
    .select("id", { count: "exact", head: true })
    .eq("stage_id", id);
  if (error) throw new Error(error.message);
  if (count) {
    throw new Error(
      `This stage still has ${count} deal${count === 1 ? "" : "s"}. Move them to another stage first.`,
    );
  }
  unwrap(await db.from("funnelo_pipeline_stages").delete().eq("id", id));
}

/** Нові позиції для всіх етапів після перетягування (етапів одиниці — простий цикл ок). */
export async function reorderStages(db: Db, orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .from("funnelo_pipeline_stages")
        .update({ position: index + 1 })
        .eq("id", id)
        .then(unwrap),
    ),
  );
}
