import { NextResponse, type NextRequest } from "next/server";
import { parseFilters } from "@/lib/anime/filters";
import { searchAnime } from "@/lib/anilist/queries";

// Проксі до AniList для клієнтського infinite scroll. Через наш сервер, а не
// напряму з браузера, бо: (1) відповіді осідають у Data Cache Next.js і
// спільні для всіх відвідувачів, (2) клієнт отримує вже змаплені легкі
// AnimeCard, (3) CDN кешує відповідь за Cache-Control нижче.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const filters = parseFilters(searchParams);
  const page = Math.min(Math.max(Number(searchParams.get("page")) || 1, 1), 1000);

  try {
    const result = await searchAnime(filters, page);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
    });
  } catch {
    return NextResponse.json({ error: "Anime database is unavailable" }, { status: 502 });
  }
}
