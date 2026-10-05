"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, m } from "motion/react";
import { ArrowRight, Dices, RefreshCw, Star } from "lucide-react";
import type { RandomPick as RandomPickData } from "@/types/anime";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

async function fetchRandom(exclude?: number): Promise<RandomPickData> {
  const response = await fetch(`/api/anime/random${exclude ? `?exclude=${exclude}` : ""}`);
  if (!response.ok) throw new Error("Failed to load a random anime");
  return response.json();
}

const randomKey = (round: number) => ["anime", "random", round] as const;

// "Random pick" на головній. Головна статична (ISR), а випадковий тайтл має
// бути різним для кожного відвідувача — тому він вантажиться на клієнті.
// Кожне натискання "Another one" — новий раунд у кеші TanStack Query, а
// наступний раунд ми вже підвантажили у фоні, тож кнопка спрацьовує миттєво.
export function RandomPick() {
  const queryClient = useQueryClient();
  const [round, setRound] = useState(0);

  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: randomKey(round),
    queryFn: () => fetchRandom(queryClient.getQueryData<RandomPickData>(randomKey(round - 1))?.id),
    // Раунд — це конкретний тайтл: не перезапитуємо його, поки він на екрані.
    staleTime: Infinity,
    // Поки (рідко) вантажиться наступний, показуємо попередній — без скелетона.
    placeholderData: keepPreviousData,
  });

  // Наперед тягнемо наступний тайтл — разом з постером, щоб і картинка була
  // в кеші браузера до кліку.
  useEffect(() => {
    if (!data) return;
    void queryClient
      .prefetchQuery({
        queryKey: randomKey(round + 1),
        queryFn: () => fetchRandom(data.id),
        staleTime: Infinity,
      })
      .then(() => {
        const next = queryClient.getQueryData<RandomPickData>(randomKey(round + 1));
        if (next?.image) new window.Image().src = next.image;
      });
  }, [data, round, queryClient]);

  const anotherProps = {
    onClick: () => setRound((value) => value + 1),
    disabled: isPending,
    spinning: isFetching,
  };

  return (
    <section className="space-y-4" aria-labelledby="random-pick-heading">
      <div className="flex items-center justify-between gap-4">
        <h2
          id="random-pick-heading"
          className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl"
        >
          <Dices className="size-6 text-primary" />
          {/* На мобільному довгий заголовок переносився поруч із кнопкою. */}
          <span className="sm:hidden">Random pick</span>
          <span className="hidden sm:inline">Can&apos;t decide? Random pick</span>
        </h2>
        {/* На десктопі кнопка — у заголовку, на мобільному — в картці. */}
        <AnotherButton className="hidden sm:inline-flex" {...anotherProps} />
      </div>

      <div className="relative overflow-hidden rounded-2xl border bg-card">
        {isPending ? (
          <RandomPickSkeleton />
        ) : isError && !data ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Couldn&apos;t roll the dice.{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => refetch()}
            >
              Try again
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={data.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <PickCard
                pick={data}
                actions={<AnotherButton className="h-8 sm:hidden" {...anotherProps} />}
              />
            </m.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}

function AnotherButton({
  onClick,
  disabled,
  spinning,
  className,
}: {
  onClick: () => void;
  disabled: boolean;
  spinning: boolean;
  className?: string;
}) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={disabled} className={className}>
      <RefreshCw className={cn(spinning && "animate-spin")} /> Another one
    </Button>
  );
}

function PickCard({ pick, actions }: { pick: RandomPickData; actions?: React.ReactNode }) {
  const meta = [pick.type, pick.year, pick.episodes ? `${pick.episodes} eps` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="relative">
      {(pick.banner ?? pick.image) && (
        <Image
          src={(pick.banner ?? pick.image)!}
          alt=""
          fill
          sizes="(min-width: 1280px) 1200px, 100vw"
          quality={60}
          className={cn("object-cover opacity-25", !pick.banner && "scale-110 blur-2xl")}
        />
      )}
      <div className="absolute inset-0 bg-linear-to-r from-card via-card/85 to-card/40" />

      <div className="relative flex flex-col gap-6 p-5 sm:flex-row sm:p-6">
        <Link
          href={`/anime/${pick.id}`}
          className="relative mx-auto aspect-2/3 w-36 shrink-0 overflow-hidden rounded-xl shadow-xl ring-1 ring-border sm:mx-0 sm:w-40"
          style={{ backgroundColor: pick.color ?? undefined }}
          aria-label={pick.title}
        >
          {pick.image && (
            <Image src={pick.image} alt="" fill sizes="160px" className="object-cover" />
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            <Link
              href={`/anime/${pick.id}`}
              className="text-2xl font-bold tracking-tight hover:text-primary"
            >
              {pick.title}
            </Link>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
              {pick.score !== null && (
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {pick.score.toFixed(1)}
                </span>
              )}
              {meta}
            </p>
          </div>

          {pick.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pick.genres.map((genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  render={<Link href={`/anime?genres=${encodeURIComponent(genre)}`} />}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {pick.synopsis && (
            <p className="line-clamp-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {pick.synopsis}
            </p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
            <Link href={`/anime/${pick.id}`} className={buttonVariants()}>
              View details <ArrowRight />
            </Link>
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}

function RandomPickSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-5 sm:flex-row sm:p-6" aria-busy>
      <Skeleton className="mx-auto aspect-2/3 w-36 rounded-xl sm:mx-0 sm:w-40" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-16 w-full max-w-3xl" />
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  );
}
