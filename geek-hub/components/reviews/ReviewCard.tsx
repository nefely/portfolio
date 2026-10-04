"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { Review } from "@/types/library";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function ReviewCard({ review, actions }: { review: Review; actions?: React.ReactNode }) {
  const [revealed, setRevealed] = useState(!review.hasSpoilers);
  const name = review.author?.displayName || review.author?.username || "Deleted user";
  const edited = review.updatedAt !== review.createdAt;

  return (
    <article className="rounded-xl border bg-card p-4 sm:p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/15 text-primary">
              {name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">
              {review.author && `@${review.author.username} · `}
              <time dateTime={review.createdAt}>{formatRelativeDate(review.createdAt)}</time>
              {edited && " · edited"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-md bg-amber-400/10 px-2 py-1 text-sm font-semibold text-amber-400">
            <Star className="size-3.5 fill-current" /> {review.score}/10
          </span>
          {actions}
        </div>
      </header>

      <div className="relative mt-3">
        <p
          className={cn(
            "text-sm leading-relaxed whitespace-pre-line",
            !revealed && "blur-sm select-none",
          )}
          aria-hidden={!revealed}
        >
          {review.body}
        </p>
        {!revealed && (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="absolute inset-0 grid place-items-center text-sm font-medium text-foreground"
          >
            <span className="rounded-full bg-background/90 px-3 py-1.5 ring-1 ring-border">
              Contains spoilers — show
            </span>
          </button>
        )}
      </div>
    </article>
  );
}
