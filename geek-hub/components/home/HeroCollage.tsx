import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { getHomeShelves } from "@/lib/anilist/queries";
import { cn } from "@/lib/utils";

// Позиції віяла: центральна картка найбільша й попереду, бічні — нахилені й
// позаду. При наведенні на віяло картки розходяться (group-hover).
const SLOTS = [
  {
    base: "-translate-x-[150px] translate-y-6 -rotate-12 scale-80 z-0",
    hover: "group-hover:-translate-x-[190px] group-hover:-rotate-[16deg]",
    delay: "0s",
  },
  {
    base: "-translate-x-[80px] translate-y-2 -rotate-6 scale-90 z-10",
    hover: "group-hover:-translate-x-[105px] group-hover:-rotate-[8deg]",
    delay: "1.2s",
  },
  {
    base: "translate-x-0 -translate-y-2 rotate-0 scale-100 z-20",
    hover: "group-hover:-translate-y-4",
    delay: "0.6s",
  },
  {
    base: "translate-x-[80px] translate-y-2 rotate-6 scale-90 z-10",
    hover: "group-hover:translate-x-[105px] group-hover:rotate-[8deg]",
    delay: "1.8s",
  },
  {
    base: "translate-x-[150px] translate-y-6 rotate-12 scale-80 z-0",
    hover: "group-hover:translate-x-[190px] group-hover:rotate-[16deg]",
    delay: "2.4s",
  },
];

// Віяло постерів трендових тайтлів праворуч від заголовка (лише десктоп).
// Дані — той самий getHomeShelves(), що й полиці: React cache() + Data Cache,
// тобто жодного додаткового запиту до AniList.
export async function HeroCollage() {
  const shelves = await getHomeShelves().catch(() => null);
  const posters = (shelves?.trending ?? []).filter((anime) => anime.image).slice(0, SLOTS.length);
  if (posters.length < SLOTS.length) return null;

  // Найпопулярніший — у центрі, решта — по боках.
  const ordered = [posters[3], posters[1], posters[0], posters[2], posters[4]];

  return (
    <div
      className="group relative hidden h-90 w-110 shrink-0 rise-in items-center justify-center lg:flex"
      style={{ animationDelay: "200ms" }}
    >
      <div
        aria-hidden
        className="absolute inset-10 rounded-full bg-[radial-gradient(closest-side,oklch(0.77_0.13_220/0.35),transparent)] blur-2xl"
      />
      {ordered.map((anime, index) => {
        const slot = SLOTS[index];
        const isCenter = index === 2;
        return (
          <Link
            key={anime.id}
            href={`/anime/${anime.id}`}
            aria-label={anime.title}
            className={cn(
              "absolute w-44 transition-transform duration-500 ease-out",
              slot.base,
              slot.hover,
            )}
          >
            {/* float — на внутрішньому елементі, позиція у віялі — на посиланні:
                обидва використовують translate, тож розносимо їх по різних вузлах. */}
            <div
              className="relative aspect-2/3 float overflow-hidden rounded-2xl shadow-2xl ring-1 shadow-black/50 ring-white/10"
              style={{ animationDelay: slot.delay, backgroundColor: anime.color ?? undefined }}
            >
              <Image
                src={anime.image!}
                alt=""
                fill
                sizes="176px"
                // Центральний постер видно одразу над згином.
                priority={isCenter}
                className="object-cover"
              />
              {isCenter && (
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 to-transparent p-3 pt-10">
                  <p className="line-clamp-2 text-sm leading-tight font-semibold text-white">
                    {anime.title}
                  </p>
                  {anime.score !== null && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-white/80">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {anime.score.toFixed(1)} · Trending #1
                    </p>
                  )}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
