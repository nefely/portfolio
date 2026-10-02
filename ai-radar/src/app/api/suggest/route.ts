import { type NextRequest, NextResponse } from "next/server";
import { type Site, getSite, normalizeDomain, searchSites } from "@/lib/freeserp";

// GET /api/suggest?q=bolt → up to 8 real sites for the compare autocomplete.
// FreeSerp's `q` is full-text over page content, so its own ranking rarely puts
// "bolt.new" first for "bolt". We pull candidates from both the AI-startup set
// and the whole index, then re-rank by how well the *domain* matches.

const LIMIT = 8;

export type Suggestion = { domain: string; title: string | null; dr: number | null; ai: boolean };

function score(site: Site, q: string, isAi: boolean): number {
  const domain = site.domain.toLowerCase();
  const name = domain.split(".")[0];
  let s = 0;
  if (domain === q || name === q) s += 1000;
  else if (domain.startsWith(q)) s += 600;
  else if (domain.includes(q)) s += 300;
  else if (site.title?.toLowerCase().includes(q)) s += 100;
  else return -1; // matched only somewhere in page content — not a useful suggestion
  if (isAi) s += 50;
  return s + (site.dr ?? 0);
}

export async function GET(req: NextRequest) {
  const q = normalizeDomain(req.nextUrl.searchParams.get("q") ?? "").slice(0, 60);
  if (q.length < 2) return NextResponse.json({ ok: true, results: [] });

  try {
    const [ai, all, exact] = await Promise.all([
      searchSites({ q, size: 50 }),
      searchSites({ q, size: 50, aiStartups: false }),
      // looks like a domain → also try an exact lookup
      q.includes(".") ? getSite(q) : Promise.resolve(null),
    ]);

    const aiDomains = new Set(ai.results.map((s) => s.domain));
    const seen = new Map<string, { site: Site; score: number }>();
    for (const site of [...(exact ? [exact] : []), ...ai.results, ...all.results]) {
      if (seen.has(site.domain)) continue;
      const sc = score(site, q, aiDomains.has(site.domain) || site.category === "ai");
      if (sc >= 0) seen.set(site.domain, { site, score: sc });
    }

    const results: Suggestion[] = [...seen.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, LIMIT)
      .map(({ site }) => ({
        domain: site.domain,
        title: site.title,
        dr: site.dr,
        ai: aiDomains.has(site.domain) || site.category === "ai",
      }));

    return NextResponse.json(
      { ok: true, results },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "upstream_error", results: [] }, { status: 502 });
  }
}
