import type { SearchParams, SortField } from "./freeserp";
import { AI_CATEGORIES, BUILDERS, SORT_KEYS } from "./taxonomy";

export const PAGE_SIZE = 24;

export type CatalogFilters = {
  q: string;
  category: string;
  builder: string;
  dr: string;
  from: string;
  to: string;
  sort: SortField;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

/** Parse & sanitize URL search params — the URL is the single source of truth for filters. */
export function parseCatalogParams(raw: RawParams): CatalogFilters {
  const q = first(raw.q).slice(0, 120);
  const category = first(raw.category);
  const builder = first(raw.builder);
  const dr = first(raw.dr);
  const from = first(raw.from);
  const to = first(raw.to);
  const sort = first(raw.sort);
  const page = Number.parseInt(first(raw.page), 10);

  return {
    q,
    category: (AI_CATEGORIES as readonly string[]).includes(category) ? category : "",
    builder: BUILDERS.some((b) => b.key === builder) ? builder : "",
    dr: /^\d{1,2}$/.test(dr) ? dr : "",
    from: isDate(from) ? from : "",
    to: isDate(to) ? to : "",
    sort: (SORT_KEYS as readonly string[]).includes(sort) ? (sort as SortField) : q ? "relevance" : "went_live",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function toApiParams(f: CatalogFilters): SearchParams {
  return {
    q: f.q || undefined,
    aiCategory: f.category || undefined,
    aiSource: f.builder || undefined,
    drMin: f.dr ? Number(f.dr) : undefined,
    fromDate: f.from || undefined,
    toDate: f.to || undefined,
    sort: f.sort,
    order: f.sort === "domain" ? "asc" : "desc",
    size: PAGE_SIZE,
    from: (f.page - 1) * PAGE_SIZE,
  };
}

/** Build a /catalog URL from filters, dropping defaults so links stay short. */
export function catalogHref(f: Partial<CatalogFilters>): string {
  const qs = new URLSearchParams();
  if (f.q) qs.set("q", f.q);
  if (f.category) qs.set("category", f.category);
  if (f.builder) qs.set("builder", f.builder);
  if (f.dr) qs.set("dr", f.dr);
  if (f.from) qs.set("from", f.from);
  if (f.to) qs.set("to", f.to);
  const defaultSort = f.q ? "relevance" : "went_live";
  if (f.sort && f.sort !== defaultSort) qs.set("sort", f.sort);
  if (f.page && f.page > 1) qs.set("page", String(f.page));
  const s = qs.toString();
  return s ? `/catalog?${s}` : "/catalog";
}
