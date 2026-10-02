import { countSites, getStats, searchSites } from "./freeserp";
import { daysAgoISO } from "./format";
import { BUILDERS } from "./taxonomy";

// Data for /niche/[slug]. FreeSerp has no per-niche time series, so the daily
// chart is built from one count query per day (size=1, read `total`).

/**
 * FreeSerp's initial crawl filled the index between ~Aug 5 and Aug 16, 2026:
 * those "launches" are the backfill (e.g. ~9,800 of 10,500 AI agents), not real
 * new sites. The chart starts after it so the trend isn't drowned by that spike.
 */
export const BACKFILL_END = "2026-08-17";
const CHART_MAX_DAYS = 30;
const DAY = 86_400_000;

const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10);

/** Run async jobs with a small concurrency cap — the free API asks for "a few req/sec". */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

export type DayCount = { date: string; count: number };

/** Rank among real niches — the catch-all "Other AI" bucket is not ranked. */
export function nicheRank(buckets: { key: string }[], category: string): number | null {
  if (category === "Other AI") return null;
  const i = buckets.filter((b) => b.key !== "Other AI").findIndex((b) => b.key === category);
  return i >= 0 ? i + 1 : null;
}

export async function getNicheData(category: string) {
  const from30 = daysAgoISO(30);

  const [stats, total, last30, latest, leaders, builders] = await Promise.all([
    getStats(),
    countSites({ aiCategory: category }),
    countSites({ aiCategory: category, fromDate: from30 }),
    searchSites({ aiCategory: category, sort: "went_live", order: "desc", size: 6 }),
    searchSites({ aiCategory: category, sort: "dr", order: "desc", size: 6 }),
    mapLimit(BUILDERS, 4, async (b) => ({ ...b, count: await countSites({ aiCategory: category, aiSource: b.key }) })),
  ]);

  // Chart window: the last CHART_MAX_DAYS days that have data, never before the backfill.
  const newest = latest.results[0]?.went_live ?? null;
  let daily: DayCount[] = [];
  if (newest && newest >= BACKFILL_END) {
    const end = Date.parse(newest);
    const start = Math.max(Date.parse(BACKFILL_END), end - (CHART_MAX_DAYS - 1) * DAY);
    const days: string[] = [];
    for (let t = start; t <= end; t += DAY) days.push(isoDay(t));
    const recent = isoDay(Date.now() - 2 * DAY);
    daily = await mapLimit(days, 4, async (date) => ({
      date,
      // to_date is inclusive; closed past days are cached for a day instead of 10 min
      count: await countSites({ aiCategory: category, fromDate: date, toDate: date }, date < recent ? 86_400 : undefined),
    }));
  }

  return {
    total,
    last30,
    from30,
    share: stats.ai_startups.total ? total / stats.ai_startups.total : 0,
    rank: nicheRank(stats.top_ai_categories, category),
    daily,
    latest: latest.results,
    leaders: leaders.results,
    builders: builders.filter((b) => b.count > 0).sort((a, b) => b.count - a.count),
  };
}
