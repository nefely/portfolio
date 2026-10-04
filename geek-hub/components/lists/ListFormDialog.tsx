"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import type { AnimeList } from "@/types/library";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateList, useUpdateList } from "@/hooks/useLists";
import {
  LIST_DESCRIPTION_MAX,
  LIST_TITLE_MAX,
  hasErrors,
  validateList,
} from "@/lib/validation/forms";

interface ListFormDialogProps {
  trigger: ReactElement;
  // Без list — створення, зі списком — редагування.
  list?: Pick<AnimeList, "id" | "title" | "description" | "isPublic">;
}

export function ListFormDialog({ trigger, list }: ListFormDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{list ? "Edit list" : "New list"}</DialogTitle>
        </DialogHeader>
        {/* Форма монтується заново при кожному відкритті — стан не "залипає". */}
        {open && <ListForm list={list} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function ListForm({ list, onDone }: { list?: ListFormDialogProps["list"]; onDone: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(list?.title ?? "");
  const [description, setDescription] = useState(list?.description ?? "");
  const [isPublic, setIsPublic] = useState(list?.isPublic ?? false);
  const [submitted, setSubmitted] = useState(false);
  const create = useCreateList();
  const update = useUpdateList(list?.id ?? "");
  const pending = create.isPending || update.isPending;

  const errors = submitted ? validateList({ title, description }) : {};

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        if (hasErrors(validateList({ title, description }))) return;
        const input = { title: title.trim(), description: description.trim() || null, isPublic };
        if (list) {
          update.mutate(input);
          onDone();
        } else {
          create.mutate(input, {
            onSuccess: (created) => {
              onDone();
              router.push(`/lists/${created.id}`);
            },
          });
        }
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="list-title">Name</Label>
        <Input
          id="list-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={LIST_TITLE_MAX}
          autoFocus
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="list-description">Description</Label>
        <Textarea
          id="list-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={LIST_DESCRIPTION_MAX}
          rows={3}
          placeholder="What ties these titles together?"
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
      </div>
      <Label className="flex items-center justify-between gap-4 rounded-lg border p-3 font-normal">
        <span>
          <span className="block text-sm font-medium">Public list</span>
          <span className="block text-xs text-muted-foreground">
            Anyone with the link can view it.
          </span>
        </span>
        <Switch checked={isPublic} onCheckedChange={setIsPublic} />
      </Label>
      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {list ? "Save changes" : "Create list"}
        </Button>
      </DialogFooter>
    </form>
  );
}
