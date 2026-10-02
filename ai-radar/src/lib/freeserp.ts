// Thin typed client for the public FreeSerp API (https://freeserp.ai/docs.php).
// Only the "sites" index (domain homepages) is used; all calls run on the server
// and are cached by Next's fetch cache so we stay polite to the free API.

const API_URL = "https://freeserp.ai/api.php";
const REVALIDATE_SECONDS = 600;

export type Site = {
  domain: string;
  url: string;
  title: string | null;
  ai_summary: string | null;
  category: string | null;
  ai_categories: string[] | null;
  ai_source: string | null;
  dr: number | null;
  went_live: string | null;
  first_seen: string | null;
  tld: string | null;
  http_status: number | null;
  content_length: number | null;
  html_size: number | null;
  webserver: string | null;
  fetched_at: string | null;
};

export type SearchResponse = {
  ok: boolean;
  total: number;
  count: number;
  from: number;
  size: number;
  results: Site[];
};

export type Bucket = { key: string; count: number };

export type StatsResponse = {
  ok: boolean;
  generated_at: string;
  totals: { real_sites: number; all_sites: number };
  new: { today: number; yesterday: number; last_7d: number; last_30d: number };
  ai_startups: { total: number; today: number };
  by_category: Bucket[];
  top_ai_categories: Bucket[];
  top_ai_source: Bucket[];
  by_day: Bucket[];
};

export type SortField = "relevance" | "went_live" | "dr" | "first_seen" | "domain";

export type SearchParams = {
  q?: string;
  aiCategory?: string;
  aiSource?: string;
  drMin?: number;
  drMax?: number;
  fromDate?: string;
  toDate?: string;
  sort?: SortField;
  order?: "asc" | "desc";
  size?: number;
  from?: number;
  /** Restrict to genuine AI products (default true). */
  aiStartups?: boolean;
  /** Include parked / empty domains (used for exact domain lookups). */
  all?: boolean;
};

/** API limit for the sites index: from + size must stay ≤ 10 000. */
export const MAX_WINDOW = 10_000;

export class FreeSerpError extends Error {}

async function request<T>(params: URLSearchParams, revalidate = REVALIDATE_SECONDS): Promise<T> {
  const url = `${API_URL}?${params.toString()}`;
  const res = await fetch(url, {
    headers: { project: "ai-radar", agent: "ai-radar-demo" },
    next: { revalidate },
  });
  if (!res.ok) {
    throw new FreeSerpError(`FreeSerp API responded with ${res.status}`);
  }
  const data = (await res.json()) as T & { ok?: boolean; error?: string };
  if (data.ok === false) {
    throw new FreeSerpError(data.error ?? "FreeSerp API returned ok=false");
  }
  return data;
}

export function buildSearchQuery(p: SearchParams): URLSearchParams {
  const qs = new URLSearchParams({ index: "sites" });
  if (p.aiStartups !== false) qs.set("ai_startups", "1");
  if (p.q) qs.set("q", p.q);
  if (p.aiCategory) qs.set("ai_categories", p.aiCategory);
  if (p.aiSource) qs.set("ai_source", p.aiSource);
  if (p.drMin != null) qs.set("dr_min", String(p.drMin));
  if (p.drMax != null) qs.set("dr_max", String(p.drMax));
  if (p.fromDate) qs.set("from_date", p.fromDate);
  if (p.toDate) qs.set("to_date", p.toDate);
  if (p.sort) qs.set("sort", p.sort);
  if (p.order) qs.set("order", p.order);
  if (p.all) qs.set("all", "1");

  const size = Math.min(Math.max(p.size ?? 20, 1), 100);
  const from = Math.min(Math.max(p.from ?? 0, 0), MAX_WINDOW - size);
  qs.set("size", String(size));
  qs.set("from", String(from));
  return qs;
}

/** evalidate overrides the cache lifetime (seconds), e.g. longer for closed date ranges. */
export function searchSites(p: SearchParams, revalidate?: number): Promise<SearchResponse> {
  return request<SearchResponse>(buildSearchQuery(p), revalidate);
}

export function getStats(): Promise<StatsResponse> {
  return request<StatsResponse>(new URLSearchParams({ stats: "1" }));
}

/** Exact domain lookup. Full-text search may return near matches, so filter strictly. */
export async function getSite(domain: string): Promise<Site | null> {
  const normalized = normalizeDomain(domain);
  if (!normalized) return null;
  const res = await searchSites({ q: normalized, all: true, aiStartups: false, size: 5 });
  return res.results.find((s) => s.domain.toLowerCase() === normalized) ?? null;
}

/** Cheap count query: size=1 and read `total`. */
export async function countSites(p: SearchParams, revalidate?: number): Promise<number> {
  const res = await searchSites({ ...p, size: 1 }, revalidate);
  return res.total;
}

export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#]/)[0];
}
