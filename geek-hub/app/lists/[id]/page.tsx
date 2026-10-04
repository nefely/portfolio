import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { ListDetail } from "@/components/lists/ListDetail";
import { fetchList } from "@/lib/library/lists";
import { listOptions } from "@/lib/query/userData";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// cache(): generateMetadata і сторінка ділять один запит до Supabase.
// RLS повертає null і для неіснуючого, і для чужого приватного списку —
// в обох випадках чесне 404, без витоку факту існування.
const getList = cache(async (id: string) => {
  if (!UUID.test(id)) return null;
  return fetchList(await createClient(), id);
});

export async function generateMetadata({ params }: PageProps<"/lists/[id]">): Promise<Metadata> {
  const list = await getList((await params).id);
  if (!list) return { title: "List not found" };

  const author = list.author?.displayName || list.author?.username;
  const description =
    list.description ??
    `${list.items.length} anime${author ? ` curated by ${author}` : ""} on GeekHub.`;
  const cover = list.items.find((item) => item.anime.image)?.anime.image;
  return {
    title: list.title,
    description,
    // Публічний список — гарне прев'ю при шерингу в месенджерах.
    openGraph: { title: list.title, description, images: cover ? [cover] : [] },
    robots: list.isPublic ? undefined : { index: false },
  };
}

export default async function ListPage({ params }: PageProps<"/lists/[id]">) {
  const { id } = await params;
  const list = await getList(id);
  if (!list) notFound();

  const queryClient = new QueryClient();
  queryClient.setQueryData(listOptions(id).queryKey, list);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ListDetail id={id} />
    </HydrationBoundary>
  );
}
