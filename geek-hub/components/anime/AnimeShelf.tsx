import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { AnimeCard as AnimeCardData } from "@/types/anime";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/motion/Reveal";
import { AnimeCard } from "./AnimeCard";
import { ShelfScroller } from "./ShelfScroller";

interface ShelfProps {
  title: string;
  href?: string;
}

const SHELF_ITEM = "w-36 shrink-0 snap-start sm:w-40 lg:w-44";

// Горизонтальна полиця на CSS scroll-snap без сторонньої каруселі. Сама
// полиця й картки рендеряться на сервері; клієнтський лише ShelfScroller
// (стрілки й затемнення країв).
export function AnimeShelf({ title, href, items }: ShelfProps & { items: AnimeCardData[] }) {
  return (
    <section className="space-y-4">
      <ShelfScroller header={<ShelfHeader title={title} href={href} />}>
        {items.map((anime, index) => (
          <Reveal key={anime.id} index={index} className={SHELF_ITEM}>
            <AnimeCard anime={anime} />
          </Reveal>
        ))}
      </ShelfScroller>
    </section>
  );
}

function ShelfHeader({ title, href }: ShelfProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-0.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          See all <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

export function AnimeShelfSkeleton({ title }: { title: string }) {
  return (
    <section className="space-y-4" aria-busy>
      <ShelfHeader title={title} />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className={SHELF_ITEM}>
            <Skeleton className="aspect-2/3 w-full rounded-xl" />
            <Skeleton className="mt-2 h-4 w-4/5" />
            <Skeleton className="mt-1 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function AnimeShelfError({ title }: { title: string }) {
  return (
    <section className="space-y-4">
      <ShelfHeader title={title} />
      <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        Couldn&apos;t load this section — the anime database is busy. Try again in a minute.
      </p>
    </section>
  );
}
