// Типи рядків БД (supabase/schema.sql). Вкладені об'єкти (company, owner, ...) —
// це вбудовування PostgREST через FK, їхній набір полів задають select-рядки
// в lib/data/*.

export type Role = "admin" | "user";

export type Profile = {
  user_id: string;
  email: string;
  full_name: string;
  title: string | null;
  role: Role;
  avatar_color: string;
  is_active: boolean;
  created_at: string;
};

/** Мінімум про людину для аватарки та підпису. */
export type PersonRef = Pick<Profile, "user_id" | "full_name" | "avatar_color">;

export type StageKind = "open" | "won" | "lost";

export type Stage = {
  id: string;
  name: string;
  position: number;
  probability: number;
  kind: StageKind;
  color: string;
};

export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"] as const;
export type CompanySize = (typeof COMPANY_SIZES)[number];

export type Company = {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: CompanySize | null;
  country: string | null;
  city: string | null;
  phone: string | null;
  notes: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CompanyListRow = Company & {
  contacts_count: number;
  open_deals_count: number;
  open_value: number;
  won_value: number;
};

export type Contact = {
  id: string;
  first_name: string;
  last_name: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  company_id: string | null;
  notes: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactRow = Contact & {
  company: { id: string; name: string } | null;
};

export type Deal = {
  id: string;
  title: string;
  value: number;
  stage_id: string;
  company_id: string | null;
  contact_id: string | null;
  owner_id: string | null;
  expected_close_date: string | null;
  position: number;
  closed_at: string | null;
  lost_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DealRow = Deal & {
  company: { id: string; name: string } | null;
  contact: { id: string; full_name: string } | null;
};

export const ACTIVITY_TYPES = ["call", "email", "meeting", "task", "note"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type Activity = {
  id: string;
  type: ActivityType;
  subject: string;
  body: string | null;
  due_at: string | null;
  completed_at: string | null;
  deal_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityRow = Activity & {
  deal: { id: string; title: string } | null;
  contact: { id: string; full_name: string } | null;
  company: { id: string; name: string } | null;
};

export type AuditAction = "insert" | "update" | "delete";

export type AuditEntry = {
  id: number;
  table_name: string;
  record_id: string;
  record_label: string | null;
  action: AuditAction;
  actor_id: string | null;
  changes: Record<string, unknown>;
  created_at: string;
};

export type Dashboard = {
  open_count: number;
  open_value: number;
  weighted_value: number;
  won_this_month: number;
  won_last_month: number;
  win_rate_90d: number | null;
  avg_won_value_90d: number | null;
  avg_cycle_days_90d: number | null;
  by_stage: {
    stage_id: string;
    name: string;
    color: string;
    kind: StageKind;
    count: number;
    value: number;
  }[];
  monthly: { month: string; won_value: number; won_count: number; lost_count: number }[];
  leaderboard: {
    user_id: string;
    full_name: string;
    avatar_color: string;
    won_value: number;
    won_count: number;
    closed_count: number;
  }[];
};
