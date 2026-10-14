import type { CompanyListParams } from "@/lib/query/keys";
import type { Company, CompanyListRow, CompanySize } from "@/types/crm";
import { type Db, type Page, ilikePattern, nullIfEmpty, pageRange, unwrap } from "./shared";

const SORTABLE = new Set([
  "name",
  "industry",
  "open_value",
  "won_value",
  "contacts_count",
  "created_at",
]);

/** Таблиця компаній — з view funnelo_companies_list (лічильники й суми рахує БД). */
export async function fetchCompanyList(
  db: Db,
  params: CompanyListParams,
  { from, to } = pageRange(params.page),
): Promise<Page<CompanyListRow>> {
  let query = db
    .from("funnelo_companies_list")
    .select("*", { count: "exact" })
    .order(SORTABLE.has(params.sort) ? params.sort : "name", { ascending: params.dir === "asc" })
    .order("id")
    .range(from, to);

  const pattern = ilikePattern(params.search);
  if (pattern)
    query = query.or(`name.ilike.${pattern},domain.ilike.${pattern},city.ilike.${pattern}`);
  if (params.ownerId) query = query.eq("owner_id", params.ownerId);
  if (params.industry) query = query.eq("industry", params.industry);

  const { data, error, count } = await query;
  return { rows: unwrap<CompanyListRow[]>({ data, error }), total: count ?? 0 };
}

export async function fetchCompany(db: Db, id: string) {
  return unwrap<CompanyListRow | null>(
    await db.from("funnelo_companies_list").select("*").eq("id", id).maybeSingle(),
  );
}

export type Option = { id: string; name: string };

/** Для селектів у формах: компаній у CRM сотні, не мільйони — вантажимо список цілком. */
export async function fetchCompanyOptions(db: Db) {
  return unwrap<Option[]>(await db.from("funnelo_companies").select("id, name").order("name"));
}

export async function fetchIndustries(db: Db) {
  const rows = unwrap<{ industry: string | null }[]>(
    await db.from("funnelo_companies").select("industry").not("industry", "is", null),
  );
  return [...new Set(rows.map((row) => row.industry as string))].sort();
}

export type CompanyInput = {
  name: string;
  domain: string | null;
  industry: string | null;
  size: CompanySize | null;
  country: string | null;
  city: string | null;
  phone: string | null;
  notes: string | null;
  owner_id: string | null;
};

export async function createCompany(db: Db, input: CompanyInput) {
  return unwrap<Company>(
    await db.from("funnelo_companies").insert(nullIfEmpty(input)).select("*").single(),
  );
}

export async function updateCompany(db: Db, id: string, patch: Partial<CompanyInput>) {
  return unwrap<Company>(
    await db.from("funnelo_companies").update(nullIfEmpty(patch)).eq("id", id).select("*").single(),
  );
}

export async function deleteCompany(db: Db, id: string) {
  unwrap(await db.from("funnelo_companies").delete().eq("id", id));
}
