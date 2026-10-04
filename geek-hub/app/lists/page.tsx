import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { ListsView } from "@/components/lists/ListsView";
import { requireUser } from "@/lib/auth/dal";
import { fetchMyLists } from "@/lib/library/lists";
import { listsOptions } from "@/lib/query/userData";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My lists" };

export default async function ListsPage() {
  const user = await requireUser("/lists");
  const supabase = await createClient();
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    ...listsOptions(user.id),
    queryFn: () => fetchMyLists(supabase, user.id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ListsView />
    </HydrationBoundary>
  );
}
