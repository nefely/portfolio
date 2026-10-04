"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Review } from "@/types/library";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteReview, useMyReview } from "@/hooks/useReviews";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";

export function MyReview({ animeId, userId }: { animeId: number; userId: string }) {
  const { data: review, isPending } = useMyReview(animeId);
  const [editing, setEditing] = useState(false);
  const remove = useDeleteReview(animeId);

  if (isPending) return <Skeleton className="h-28 rounded-xl" />;

  if (!review || editing) {
    return (
      <ReviewForm
        key={review?.id ?? userId}
        animeId={animeId}
        initial={review ?? null}
        onDone={() => setEditing(false)}
        onCancel={review ? () => setEditing(false) : undefined}
      />
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wider text-primary uppercase">Your review</p>
      <ReviewCard
        review={review}
        actions={
          <OwnerActions
            review={review}
            onEdit={() => setEditing(true)}
            onDelete={() => remove.mutate(review.id)}
            deleting={remove.isPending}
          />
        }
      />
    </div>
  );
}

function OwnerActions({
  review,
  onEdit,
  onDelete,
  deleting,
}: {
  review: Review;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex">
      <Button variant="ghost" size="icon-sm" aria-label="Edit review" onClick={onEdit}>
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Delete review"
        disabled={deleting}
        onClick={() => {
          if (window.confirm(`Delete your review (${review.score}/10)?`)) onDelete();
        }}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
