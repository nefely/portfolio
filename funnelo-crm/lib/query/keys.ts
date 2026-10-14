// Контракт кешу TanStack Query: ключі в одному місці. Ієрархія важлива —
// інвалідація ["deals"] зачіпає і канбан, і таблицю, і картки угод, а
// realtime-підписка (hooks/useRealtimeSync) інвалідує цілі гілки.

export type DealListParams = {
  page: number;
  sort: string;
  dir: "asc" | "desc";
  search: string;
  stageId: string;
  ownerId: string;
  status: "all" | "open" | "won" | "lost";
};

export type CompanyListParams = {
  page: number;
  sort: string;
  dir: "asc" | "desc";
  search: string;
  ownerId: string;
  industry: string;
};

export type ContactListParams = {
  page: number;
  sort: string;
  dir: "asc" | "desc";
  search: string;
  ownerId: string;
};

export type ActivityListParams = {
  ownerId: string;
  scope: "open" | "completed";
};

export const queryKeys = {
  me: ["me"] as const,
  team: ["team"] as const,
  stages: ["stages"] as const,

  deals: ["deals"] as const,
  board: ["deals", "board"] as const,
  dealList: (params: DealListParams) => ["deals", "list", params] as const,
  deal: (id: string) => ["deals", "detail", id] as const,
  dealsByCompany: (companyId: string) => ["deals", "company", companyId] as const,
  dealsByContact: (contactId: string) => ["deals", "contact", contactId] as const,

  companies: ["companies"] as const,
  companyList: (params: CompanyListParams) => ["companies", "list", params] as const,
  company: (id: string) => ["companies", "detail", id] as const,
  companyOptions: ["companies", "options"] as const,
  industries: ["companies", "industries"] as const,

  contacts: ["contacts"] as const,
  contactList: (params: ContactListParams) => ["contacts", "list", params] as const,
  contact: (id: string) => ["contacts", "detail", id] as const,
  contactsByCompany: (companyId: string) => ["contacts", "company", companyId] as const,
  contactOptions: ["contacts", "options"] as const,

  activities: ["activities"] as const,
  activityList: (params: ActivityListParams) => ["activities", "list", params] as const,
  activitiesFor: (kind: "deal" | "company" | "contact", id: string) =>
    ["activities", kind, id] as const,
  dueToday: (ownerId: string) => ["activities", "due", ownerId] as const,

  dashboard: (ownerId: string | null) => ["dashboard", ownerId ?? "team"] as const,
  audit: (page: number, table: string) => ["audit", page, table] as const,
};
