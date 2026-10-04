"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe, ListVideo, Lock, Plus } from "lucide-react";
import type { AnimeList } from "@/types/library";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyLists } from "@/hooks/useLists";
import { ListFormDialog } from "./ListFormDialog";

export function ListsView() {
  const { data: lists, isPending, isError } = useMyLists();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">My lists</h1>
          <p className="text-muted-foreground">Curate collections and share them with a link.</p>
        </div>
        <ListFormDialog
          trigger={
            <Button size="lg">
              <Plus /> New list
            </Button>
          }
        />
      </div>

      <div className="mt-8">
        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-destructive">Couldn&apos;t load your lists.</p>
        ) : lists.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed p-12 text-center">
            <ListVideo className="size-10 text-muted-foreground" />
            <p className="mt-3 font-medium">No lists yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              &quot;Best of 2024&quot;, &quot;Starter pack for friends&quot;, &quot;Comfort
              rewatches&quot; — make one and share it.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <MemoListCard key={list.id} list={list} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ListCard({ list }: { list: AnimeList }) {
  const covers = list.items.slice(0, 4);
  return (
    <Link
      href={`/lists/${list.id}`}
      className="group overflow-hidden rounded-2xl border bg-card transition-colors hover:border-primary/40"
    >
      <div className="grid h-36 grid-cols-4 gap-px bg-muted">
        {Array.from({ length: 4 }, (_, index) => {
          const item = covers[index];
          return (
            <div key={item?.animeId ?? `empty-${index}`} className="relative bg-secondary">
              {item?.anime.image && (
                <Image
                  src={item.anime.image}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="space-y-1 p-4">
        <h2 className="line-clamp-1 font-semibold group-hover:text-primary">{list.title}</h2>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {list.isPublic ? <Globe className="size-3" /> : <Lock className="size-3" />}
          {list.isPublic ? "Public" : "Private"} · {list.items.length}{" "}
          {list.items.length === 1 ? "title" : "titles"}
        </p>
        {list.description && (
          <p className="line-clamp-2 pt-1 text-sm text-muted-foreground">{list.description}</p>
        )}
      </div>
    </Link>
  );
}

const MemoListCard = memo(ListCard);
