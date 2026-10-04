import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AnimeShelf, AnimeShelfError, AnimeShelfSkeleton } from "@/components/anime/AnimeShelf";
import { FadeIn } from "@/components/motion/FadeIn";
import { currentSeason, getHomeShelves, type HomeShelf } from "@/lib/anilist/queries";

// ISR: сторінка статична й перебудовується у фоні раз на 10 хвилин —
// відвідувачі не чекають на AniList і не витрачають його ліміт.
export const revalidate = 600;

interface ShelfConfig {
  shelf: HomeShelf;
  title: string;
  href: string;
}

function shelvesConfig(): ShelfConfig[] {
  const { season, year } = currentSeason();
  const seasonName = season.charAt(0) + season.slice(1).toLowerCase();
  return [
    { shelf: "trending", title: "Trending now", href: "/anime?sort=trending" },
    {
      shelf: "season",
      title: `Popular in ${seasonName} ${year}`,
      href: `/anime?season=${season.toLowerCase()}&year=${year}`,
    },
    { shelf: "top", title: "All-time top rated", href: "/anime?sort=score" },
    { shelf: "upcoming", title: "Coming soon", href: "/anime?status=upcoming" },
  ];
}

export default function HomePage() {
  const shelves = shelvesConfig();
  return (
    <>
      <Hero />
      <div className="mx-auto max-w-7xl space-y-12 px-4 pb-16 sm:px-6">
        {/* Усі полиці приходять одним GraphQL-запитом, тож і Suspense один. */}
        <Suspense
          fallback={shelves.map(({ shelf, title }) => (
            <AnimeShelfSkeleton key={shelf} title={title} />
          ))}
        >
          <Shelves shelves={shelves} />
        </Suspense>
      </div>
    </>
  );
}

async function Shelves({ shelves }: { shelves: ShelfConfig[] }) {
  // Збій AniList ловимо на рівні даних: замість полиць — заглушки, решта
  // сторінки рендериться нормально.
  const data = await getHomeShelves().catch(() => null);
  return shelves.map(({ shelf, title, href }) =>
    data ? (
      <AnimeShelf key={shelf} title={title} href={href} items={data[shelf]} />
    ) : (
      <AnimeShelfError key={shelf} title={title} />
    ),
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_0%,oklch(0.7_0.21_340/0.25),transparent),radial-gradient(50%_50%_at_90%_10%,oklch(0.78_0.13_210/0.18),transparent)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-14 sm:px-6 sm:pt-24 sm:pb-20">
        <FadeIn className="max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" /> 20,000+ anime in one place
          </span>
          <h1 className="text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
            Your anime life, <span className="text-gradient">organized.</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Discover new shows, track every episode, build lists worth sharing and see what other
            fans really think.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/anime" className={buttonVariants({ size: "lg", className: "h-11 px-5" })}>
              Browse anime <ArrowRight />
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({ size: "lg", variant: "outline", className: "h-11 px-5" })}
            >
              Create free account
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
