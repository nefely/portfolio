"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COMMON_REASONS = [
  "Chose a competitor",
  "Price too high",
  "Budget cut",
  "No decision made",
  "Bad timing",
];

/** Причина програшу — вона потрапляє у звіти, тож питаємо одразу при переносі в Lost. */
export function LostReasonDialog({
  dealTitle,
  onConfirm,
  onCancel,
}: {
  dealTitle: string | null;
  onConfirm: (reason: string | null) => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={dealTitle !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        {dealTitle !== null && (
          <LostReasonForm dealTitle={dealTitle} onConfirm={onConfirm} onCancel={onCancel} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function LostReasonForm({
  dealTitle,
  onConfirm,
  onCancel,
}: {
  dealTitle: string;
  onConfirm: (reason: string | null) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onConfirm(reason.trim() || null);
      }}
    >
      <DialogHeader>
        <DialogTitle>Mark as lost</DialogTitle>
        <DialogDescription>Why was “{dealTitle}” lost?</DialogDescription>
      </DialogHeader>
      <div className="flex flex-wrap gap-1.5">
        {COMMON_REASONS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setReason(item)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs transition-colors",
              reason === item
                ? "border-primary bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <Input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Or type a reason"
        maxLength={300}
        aria-label="Lost reason"
        autoFocus
      />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="destructive">
          Mark as lost
        </Button>
      </DialogFooter>
    </form>
  );
}
