import type { DealListParams } from "@/lib/query/keys";
import type { DealRow } from "@/types/crm";
import { type Db, type Page, ilikePattern, nullIfEmpty, pageRange, unwrap } from "./shared";

// Власника не вбудовуємо: команда вже в кеші (useTeam), і картці досить owner_id.
export const DEAL_SELECT =
  "*, company:funnelo_companies(id, name), contact:funnelo_contacts(id, full_name)";

const SORTABLE = new Set(["title", "value", "expected_close_date", "created_at", "closed_at"]);

/** Канбан: лише відкриті угоди (won/lost живуть у таблиці та на дашборді). */
export async function fetchBoardDeals(db: Db) {
  return unwrap<DealRow[]>(
    await db
      .from("funnelo_deals")
      .select(`${DEAL_SELECT}, stage:funnelo_pipeline_stages!inner(kind)`)
      .eq("stage.kind", "open")
      .order("position"),
  );
}

export async function fetchDealList(
  db: Db,
  params: DealListParams,
  { from, to } = pageRange(params.page),
): Promise<Page<DealRow>> {
  // Фільтр за статусом (open/won/lost) — через inner join на етап.
  const columns =
    params.status === "all"
      ? DEAL_SELECT
      : `${DEAL_SELECT}, stage:funnelo_pipeline_stages!inner(kind)`;

  let query = db
    .from("funnelo_deals")
    .select(columns as typeof DEAL_SELECT, { count: "exact" })
    .order(SORTABLE.has(params.sort) ? params.sort : "created_at", {
      ascending: params.dir === "asc",
      nullsFirst: false,
    })
    .order("id")
    .range(from, to);

  const pattern = ilikePattern(params.search);
  if (pattern) query = query.ilike("title", pattern);
  if (params.stageId) query = query.eq("stage_id", params.stageId);
  if (params.ownerId) query = query.eq("owner_id", params.ownerId);
  if (params.status !== "all") query = query.eq("stage.kind", params.status);

  const { data, error, count } = await query;
  return { rows: unwrap<DealRow[]>({ data, error }), total: count ?? 0 };
}

/** null — запис видалено (зокрема колегою, поки сторінка була відкрита). */
export async function fetchDeal(db: Db, id: string) {
  return unwrap<DealRow | null>(
    await db.from("funnelo_deals").select(DEAL_SELECT).eq("id", id).maybeSingle(),
  );
}

export async function fetchDealsByCompany(db: Db, companyId: string) {
  return unwrap<DealRow[]>(
    await db
      .from("funnelo_deals")
      .select(DEAL_SELECT)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
  );
}

export async function fetchDealsByContact(db: Db, contactId: string) {
  return unwrap<DealRow[]>(
    await db
      .from("funnelo_deals")
      .select(DEAL_SELECT)
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false }),
  );
}

export type DealInput = {
  title: string;
  value: number;
  stage_id: string;
  company_id: string | null;
  contact_id: string | null;
  owner_id: string | null;
  expected_close_date: string | null;
  notes: string | null;
};

export async function createDeal(db: Db, input: DealInput, position: number) {
  return unwrap<DealRow>(
    await db
      .from("funnelo_deals")
      .insert({ ...nullIfEmpty(input), position })
      .select(DEAL_SELECT)
      .single(),
  );
}

export async function updateDeal(
  db: Db,
  id: string,
  patch: Partial<DealInput> & { lost_reason?: string | null; position?: number },
) {
  return unwrap<DealRow>(
    await db
      .from("funnelo_deals")
      .update(nullIfEmpty(patch))
      .eq("id", id)
      .select(DEAL_SELECT)
      .single(),
  );
}

export async function deleteDeal(db: Db, id: string) {
  unwrap(await db.from("funnelo_deals").delete().eq("id", id));
}
