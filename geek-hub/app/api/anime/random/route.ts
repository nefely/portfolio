import { NextResponse, type NextRequest } from "next/server";
import { getRandomAnime } from "@/lib/anilist/queries";

// Випадковий тайтл для блоку "Random pick". Відповідь випадкова за природою,
// тож CDN/браузер її не кешують; кешуються лише сторінки AniList всередині
// getRandomAnime (Data Cache), тому в AniList летить небагато запитів.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const exclude = Number(request.nextUrl.searchParams.get("exclude")) || undefined;
  try {
    const pick = await getRandomAnime(exclude);
    if (!pick) return NextResponse.json({ error: "No anime found" }, { status: 404 });
    return NextResponse.json(pick, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Anime database is unavailable" }, { status: 502 });
  }
}
