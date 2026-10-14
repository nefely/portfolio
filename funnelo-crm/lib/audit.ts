import type { AuditEntry } from "@/types/crm";

export const AUDIT_TABLES: Record<string, { label: string; href?: (id: string) => string }> = {
  funnelo_deals: { label: "Deal", href: (id) => `/deals/${id}` },
  funnelo_companies: { label: "Company", href: (id) => `/companies/${id}` },
  funnelo_contacts: { label: "Contact", href: (id) => `/contacts/${id}` },
  funnelo_pipeline_stages: { label: "Stage" },
  funnelo_profiles: { label: "Member" },
};

const FIELD_LABELS: Record<string, string> = {
  stage_id: "Stage",
  owner_id: "Owner",
  company_id: "Company",
  contact_id: "Contact",
  expected_close_date: "Expected close",
  closed_at: "Closed",
  lost_reason: "Lost reason",
  full_name: "Name",
  first_name: "First name",
  last_name: "Last name",
  is_active: "Access",
  avatar_color: "Avatar color",
  job_title: "Job title",
};

// Технічні поля, які в журналі лише шумлять.
const HIDDEN_FIELDS = new Set([
  "id",
  "user_id",
  "full_name_generated",
  "avatar_color",
  "closed_at",
]);

export type ChangeLine = { field: string; from: string | null; to: string | null };

export type Resolvers = {
  stage: (id: string) => string | undefined;
  person: (id: string) => string | undefined;
  money: (value: number) => string;
};

function humanField(field: string) {
  return FIELD_LABELS[field] ?? field.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function humanValue(field: string, value: unknown, resolve: Resolvers): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (field === "stage_id") return resolve.stage(String(value)) ?? "deleted stage";
  if (field === "owner_id" || field === "actor_id")
    return resolve.person(String(value)) ?? "former member";
  if (field === "value" && typeof value === "number") return resolve.money(value);
  if (field === "is_active") return value ? "enabled" : "disabled";
  // Зв'язки з компанією/контактом — лише факт зміни, назву показує сам запис.
  if (field === "company_id" || field === "contact_id") return "linked";
  return String(value);
}

/**
 * Запис журналу → рядки "поле: було → стало". Для update — лише змінені поля
 * (так їх зберігає тригер funnelo_audit), для insert/delete — кілька ключових.
 */
export function describeChanges(entry: AuditEntry, resolve: Resolvers): ChangeLine[] {
  if (entry.action === "update") {
    return Object.entries(entry.changes)
      .filter(([field]) => !HIDDEN_FIELDS.has(field))
      .map(([field, change]) => {
        const { old: before, new: after } = (change ?? {}) as { old?: unknown; new?: unknown };
        return {
          field: humanField(field),
          from: humanValue(field, before, resolve),
          to: humanValue(field, after, resolve),
        };
      });
  }

  const keyFields = ["stage_id", "value", "owner_id", "role"];
  return keyFields
    .filter((field) => entry.changes[field] !== undefined && entry.changes[field] !== null)
    .map((field) => ({
      field: humanField(field),
      from: null,
      to: humanValue(field, entry.changes[field], resolve),
    }));
}
