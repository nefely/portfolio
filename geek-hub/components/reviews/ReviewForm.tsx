"use client";

import { useState } from "react";
import type { Review } from "@/types/library";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScoreSelect } from "@/components/library/ScoreSelect";
import { useSaveReview } from "@/hooks/useReviews";
import { REVIEW_MAX, hasErrors, validateReview } from "@/lib/validation/forms";

interface ReviewFormProps {
  animeId: number;
  initial: Review | null;
  onDone: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ animeId, initial, onDone, onCancel }: ReviewFormProps) {
  const [score, setScore] = useState<number | null>(initial?.score ?? null);
  const [body, setBody] = useState(initial?.body ?? "");
  const [hasSpoilers, setHasSpoilers] = useState(initial?.hasSpoilers ?? false);
  const [submitted, setSubmitted] = useState(false);
  const save = useSaveReview(animeId);

  // Помилки показуємо лише після першої спроби — не лякаємо юзера, поки він пише.
  const errors = submitted ? validateReview({ score, body }) : {};

  return (
    <form
      className="space-y-3 rounded-xl border bg-card p-4 sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        if (hasErrors(validateReview({ score, body }))) return;
        save.mutate(
          { animeId, score: score!, body: body.trim(), hasSpoilers },
          { onSuccess: onDone },
        );
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{initial ? "Edit your review" : "Write a review"}</p>
        <ScoreSelect value={score} onChange={setScore} />
      </div>
      {errors.score && <p className="text-xs text-destructive">{errors.score}</p>}

      <div className="space-y-1">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What worked for you, what didn't? Keep it spoiler-free or tick the box below."
          rows={5}
          maxLength={REVIEW_MAX}
          aria-label="Review text"
          aria-invalid={Boolean(errors.body)}
        />
        <div className="flex justify-between text-xs">
          <span className="text-destructive">{errors.body}</span>
          <span className="text-muted-foreground tabular-nums">
            {body.length}/{REVIEW_MAX}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="flex items-center gap-2 text-sm font-normal">
          <Checkbox checked={hasSpoilers} onCheckedChange={setHasSpoilers} />
          Contains spoilers
        </Label>
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : initial ? "Update review" : "Post review"}
          </Button>
        </div>
      </div>
    </form>
  );
}
