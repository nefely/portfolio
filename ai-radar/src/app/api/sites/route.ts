import { type NextRequest, NextResponse } from "next/server";
import { getSite, normalizeDomain } from "@/lib/freeserp";

// GET /api/sites?domains=a.com,b.ai → profiles for a list of domains.
// Used by client pages (favorites) whose domain list lives in the browser.
const MAX_DOMAINS = 24;

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("domains") ?? "";
  const domains = [...new Set(raw.split(",").map(normalizeDomain).filter(Boolean))].slice(0, MAX_DOMAINS);

  if (domains.length === 0) {
    return NextResponse.json({ ok: true, results: [] });
  }

  try {
    const results = await Promise.all(domains.map(async (domain) => ({ domain, site: await getSite(domain) })));
    return NextResponse.json({ ok: true, results });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream_error" }, { status: 502 });
  }
}
