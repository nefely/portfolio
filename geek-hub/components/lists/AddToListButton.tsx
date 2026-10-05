"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, ListPlus, Lock, Plus } from "lucide-react";
import type { AnimeCard } from "@/types/anime";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateList, useMyLists, useToggleListItem } from "@/hooks/useLists";
import { useSessionUser } from "@/hooks/useSessionUser";
import { LIST_TITLE_MAX } from "@/lib/validation/forms";

export function AddToListButton({ anime }: { anime: AnimeCard }) {
  const { user, isPending } = useSessionUser();
  const pathname = usePathname();

  if (isPending) return <Skeleton className="h-9 w-36" />;
  if (!user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className={buttonVariants({ variant: "outline", size: "lg" })}
      >
        <ListPlus /> Add to list
      </Link>
    );
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="lg" />}>
        <ListPlus /> Add to list
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to list</DialogTitle>
          <DialogDescription className="line-clamp-1">{anime.title}</DialogDescription>
        </DialogHeader>
        {/* Вміст монтується лише при відкритті — запит списків іде тоді ж. */}
        <ListPicker anime={anime} />
      </DialogContent>
    </Dialog>
  );
}

function ListPicker({ anime }: { anime: AnimeCard }) {
  const { data: lists, isPending, isError } = useMyLists();
  const toggle = useToggleListItem();
  const createList = useCreateList();
  const [title, setTitle] = useState("");

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      const list = await createList.mutateAsync({
        title: trimmed,
        description: null,
        isPublic: false,
      });
      setTitle("");
      toggle.mutate({ listId: list.id, anime, add: true });
    } catch {
      // Тост уже показав onError у useCreateList.
    }
  };

  return (
    <div className="space-y-4">
      {isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">Couldn&apos;t load your lists.</p>
      ) : lists.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You don&apos;t have any lists yet — create the first one below.
        </p>
      ) : (
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {lists.map((list) => {
            const checked = list.items.some((item) => item.animeId === anime.id);
            return (
              <li key={list.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) => toggle.mutate({ listId: list.id, anime, add: next })}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">{list.title}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {list.isPublic ? <Globe className="size-3" /> : <Lock className="size-3" />}
                    {list.items.length}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleCreate} className="flex gap-2 border-t pt-4">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="New list name"
          maxLength={LIST_TITLE_MAX}
          aria-label="New list name"
        />
        <Button type="submit" disabled={!title.trim() || createList.isPending}>
          <Plus /> Create
        </Button>
      </form>
    </div>
  );
}
