"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import type { Review } from "@/types/library";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/motion/Reveal";
import { useInView } from "@/hooks/useInView";
import { useReviews } from "@/hooks/useReviews";
import { useSessionUser } from "@/hooks/useSessionUser";
import { MyReview } from "./MyReview";
import { ReviewCard } from "./ReviewCard";

// Відгуки нижче згину: монтуємо список (і робимо запит у Supabase) лише коли
// секція наблизилась до в'юпорту. Хто не доскролив — не платить запитом.
export function ReviewsSection({ animeId }: { animeId: number }) {
  const { ref, inView } = useInView<HTMLElement>("400px");
  const [activated, setActivated] = useState(false);
  if (inView && !activated) setActivated(true);

  return (
    <section ref={ref} className="space-y-6" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="flex items-center gap-2 text-xl font-semibold">
        <MessageSquare className="size-5" /> Reviews
      </h2>
      {activated ? (
        <>
          <ReviewComposer animeId={animeId} />
          <ReviewList animeId={animeId} />
        </>
      ) : (
        <ReviewsSkeleton />
      )}
    </section>
  );
}

function ReviewComposer({ animeId }: { animeId: number }) {
  const { user, isPending } = useSessionUser();
  const pathname = usePathname();

  if (isPending) return <Skeleton className="h-24 rounded-xl" />;
  if (!user) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed p-4">
        <p className="text-sm text-muted-foreground">Watched it? Share what you think.</p>
        <Link
          href={`/login?next=${encodeURIComponent(pathname)}`}
          className={buttonVariants({ size: "sm" })}
        >
          Sign in to review
        </Link>
      </div>
    );
  }
  return <MyReview animeId={animeId} userId={user.id} />;
}

// Структурне спільне використання TanStack: при довантаженні сторінки старі
// відгуки — ті самі об'єкти, і memo пропускає їх рендер.
const MemoReviewCard = memo(ReviewCard);

function ReviewList({ animeId }: { animeId: number }) {
  const { user } = useSessionUser();
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useReviews(animeId);

  if (isPending) return <ReviewsSkeleton />;
  if (isError) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm">
        Couldn&apos;t load reviews.{" "}
        <button type="button" className="text-primary hover:underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  // Власний відгук показуємо окремо вгорі (MyReview), у стрічці — лише чужі.
  const reviews: Review[] = data.pages
    .flatMap((page) => page.reviews)
    .filter((review) => review.author?.userId !== user?.id);
  const total = data.pages[0]?.total ?? 0;

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "review" : "reviews"}
      </p>
      {reviews.map((review, index) => (
        <Reveal key={review.id} index={index % 3}>
          <MemoReviewCard review={review} />
        </Reveal>
      ))}
      {hasNextPage && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading…" : "Show more reviews"}
        </Button>
      )}
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-3" aria-busy>
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
    </div>
  );
}
