import type { ContactListParams } from "@/lib/query/keys";
import type { ContactRow } from "@/types/crm";
import { type Db, type Page, ilikePattern, nullIfEmpty, pageRange, unwrap } from "./shared";

export const CONTACT_SELECT = "*, company:funnelo_companies(id, name)";

const SORTABLE = new Set(["full_name", "email", "job_title", "created_at"]);

export async function fetchContactList(
  db: Db,
  params: ContactListParams,
  { from, to } = pageRange(params.page),
): Promise<Page<ContactRow>> {
  let query = db
    .from("funnelo_contacts")
    .select(CONTACT_SELECT, { count: "exact" })
    .order(SORTABLE.has(params.sort) ? params.sort : "full_name", {
      ascending: params.dir === "asc",
      nullsFirst: false,
    })
    .order("id")
    .range(from, to);

  const pattern = ilikePattern(params.search);
  if (pattern) {
    query = query.or(
      `full_name.ilike.${pattern},email.ilike.${pattern},job_title.ilike.${pattern}`,
    );
  }
  if (params.ownerId) query = query.eq("owner_id", params.ownerId);

  const { data, error, count } = await query;
  return { rows: unwrap<ContactRow[]>({ data, error }), total: count ?? 0 };
}

export async function fetchContact(db: Db, id: string) {
  return unwrap<ContactRow | null>(
    await db.from("funnelo_contacts").select(CONTACT_SELECT).eq("id", id).maybeSingle(),
  );
}

export async function fetchContactsByCompany(db: Db, companyId: string) {
  return unwrap<ContactRow[]>(
    await db
      .from("funnelo_contacts")
      .select(CONTACT_SELECT)
      .eq("company_id", companyId)
      .order("full_name"),
  );
}

export type ContactOption = { id: string; full_name: string; company_id: string | null };

export async function fetchContactOptions(db: Db) {
  return unwrap<ContactOption[]>(
    await db.from("funnelo_contacts").select("id, full_name, company_id").order("full_name"),
  );
}

export type ContactInput = {
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  company_id: string | null;
  notes: string | null;
  owner_id: string | null;
};

export async function createContact(db: Db, input: ContactInput) {
  return unwrap<ContactRow>(
    await db.from("funnelo_contacts").insert(nullIfEmpty(input)).select(CONTACT_SELECT).single(),
  );
}

export async function updateContact(db: Db, id: string, patch: Partial<ContactInput>) {
  return unwrap<ContactRow>(
    await db
      .from("funnelo_contacts")
      .update(nullIfEmpty(patch))
      .eq("id", id)
      .select(CONTACT_SELECT)
      .single(),
  );
}

export async function deleteContact(db: Db, id: string) {
  unwrap(await db.from("funnelo_contacts").delete().eq("id", id));
}
