import type { AuditEntry, Dashboard } from "@/types/crm";
import { type Db, type Page, pageRange, unwrap } from "./shared";

/** Усі метрики дашборду рахує БД одним RPC (funnelo_dashboard у schema.sql). */
export async function fetchDashboard(db: Db, ownerId: string | null) {
  return unwrap<Dashboard>(await db.rpc("funnelo_dashboard", { p_owner: ownerId }));
}

/** Журнал змін — RLS віддає його лише admin. */
export async function fetchAudit(db: Db, page: number, table: string): Promise<Page<AuditEntry>> {
  const { from, to } = pageRange(page);
  let query = db
    .from("funnelo_audit_log")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);
  if (table) query = query.eq("table_name", table);

  const { data, error, count } = await query;
  return { rows: unwrap<AuditEntry[]>({ data, error }), total: count ?? 0 };
}
