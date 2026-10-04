"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Globe, Lock, Pencil, Trash2, X } from "lucide-react";
import type { ListItem } from "@/types/library";
import { Button } from "@/components/ui/button";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { GRID_CLASSES } from "@/components/anime/AnimeGrid";
import { useDeleteList, useToggleListItem, useUpdateList } from "@/hooks/useLists";
import { useSessionUser } from "@/hooks/useSessionUser";
import { listOptions } from "@/lib/query/userData";
import { formatRelativeDate } from "@/lib/dates";
import { ListFormDialog } from "./ListFormDialog";
import { ShareButton } from "./ShareButton";

export function ListDetail({ id }: { id: string }) {
  const { data: list } = useQuery(listOptions(id));
  const { user } = useSessionUser();
  const router = useRouter();
  const update = useUpdateList(id);
  const remove = useDeleteList();

  if (!list) return null;
  const isOwner = user?.id === list.userId;
  const author = list.author?.displayName || list.author?.username;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {list.isPublic ? <Globe className="size-3.5" /> : <Lock className="size-3.5" />}
            {list.isPublic ? "Public list" : "Private list"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{list.title}</h1>
          {list.description && <p className="text-muted-foreground">{list.description}</p>}
          <p className="text-sm text-muted-foreground">
            {author && (
              <>
                by <span className="font-medium text-foreground">{author}</span> ·{" "}
              </>
            )}
            {list.items.length} {list.items.length === 1 ? "title" : "titles"} · updated{" "}
            {formatRelativeDate(list.updatedAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ShareButton
            title={list.title}
            isPublic={list.isPublic}
            onMakePublic={
              isOwner
                ? () =>
                    update.mutate({
                      title: list.title,
                      description: list.description,
                      isPublic: true,
                    })
                : undefined
            }
          />
          {isOwner && (
            <>
              <ListFormDialog
                list={list}
                trigger={
                  <Button variant="outline">
                    <Pencil /> Edit
                  </Button>
                }
              />
              <Button
                variant="destructive"
                disabled={remove.isPending}
                onClick={() => {
                  if (!window.confirm(`Delete "${list.title}"? This can't be undone.`)) return;
                  remove.mutate(list.id, { onSuccess: () => router.push("/lists") });
                }}
              >
                <Trash2 /> Delete
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="mt-8">
        {list.items.length === 0 ? (
          <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            {isOwner
              ? "This list is empty. Open any anime and use “Add to list”."
              : "This list is empty."}
          </p>
        ) : (
          <div className={GRID_CLASSES}>
            {list.items.map((item) => (
              <MemoListItemCard
                key={item.animeId}
                item={item}
                listId={list.id}
                removable={isOwner}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ListItemCard({
  item,
  listId,
  removable,
}: {
  item: ListItem;
  listId: string;
  removable: boolean;
}) {
  const toggle = useToggleListItem();
  return (
    <div className="relative">
      <AnimeCard anime={item.anime} />
      {removable && (
        <Button
          variant="secondary"
          size="icon-sm"
          className="absolute right-2 bottom-14 rounded-full shadow-lg"
          aria-label={`Remove ${item.anime.title} from list`}
          onClick={() => toggle.mutate({ listId, anime: item.anime, add: false })}
        >
          <X />
        </Button>
      )}
    </div>
  );
}

const MemoListItemCard = memo(ListItemCard);
