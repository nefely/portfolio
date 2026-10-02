import { type NextRequest, NextResponse } from "next/server";
import { normalizeDomain } from "@/lib/freeserp";

// GET /api/favicon?domain=example.ai → the site's favicon, or a neutral letter avatar.
// Google's favicon service answers 404 (with a generic globe) for sites without an
// icon, which shows up as console errors and a meaningless globe in the UI. Proxying
// it lets us swap that for our own placeholder and cache both on the CDN.

const ICON_CACHE = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";
const DOMAIN_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

function placeholder(domain: string) {
  const letter = (domain.match(/[a-z0-9]/)?.[0] ?? "?").toUpperCase();
  // just the letter: the <Favicon> frame supplies the background.
  // neutral mid-gray reads fine on both the dark and the light theme
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><text x="32" y="33" text-anchor="middle" dominant-baseline="central" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="42" font-weight="600" fill="#8b8b96">${letter}</text></svg>`;
  return new NextResponse(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": ICON_CACHE },
  });
}

export async function GET(req: NextRequest) {
  const domain = normalizeDomain(req.nextUrl.searchParams.get("domain") ?? "");
  if (!DOMAIN_RE.test(domain) || domain.length > 253) return placeholder(domain);

  try {
    const res = await fetch(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`, {
      next: { revalidate: 604800 },
      signal: AbortSignal.timeout(4000),
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return placeholder(domain);

    return new NextResponse(await res.arrayBuffer(), {
      headers: { "Content-Type": type, "Cache-Control": ICON_CACHE },
    });
  } catch {
    return placeholder(domain);
  }
}
