import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { AnimeCard as AnimeCardData } from "@/types/anime";
import { formatEpisodes } from "@/lib/anime/labels";
import { EntryStatusBadge } from "./EntryStatusBadge";

interface AnimeCardProps {
  anime: AnimeCardData;
  // Перші картки над згином — завантажуємо одразу (покращує LCP).
  priority?: boolean;
}

export const POSTER_SIZES =
  "(min-width: 1280px) 190px, (min-width: 1024px) 18vw, (min-width: 640px) 24vw, 45vw";

// Без "use client": той самий компонент рендерить сервер (полиці на головній)
// і клієнт (сітка каталогу). Клієнтський лише крихітний EntryStatusBadge.
export function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  const meta = [
    anime.type,
    anime.year,
    anime.episodes !== null ? formatEpisodes(anime.episodes) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring"
    >
      <div
        className="relative aspect-2/3 overflow-hidden rounded-xl bg-muted ring-1 ring-border"
        // Домінантний колір постера як заглушка — без "дірки", поки вантажиться картинка.
        style={{ backgroundColor: anime.color ?? undefined }}
      >
        {anime.image ? (
          <Image
            src={anime.image}
            alt=""
            fill
            sizes={POSTER_SIZES}
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        {anime.score !== null && (
          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/65 px-1.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {anime.score.toFixed(1)}
          </span>
        )}
        <EntryStatusBadge animeId={anime.id} className="absolute top-2 right-2" />
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm leading-snug font-medium transition-colors group-hover:text-primary">
        {anime.title}
      </h3>
      {meta && <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>}
    </Link>
  );
}
