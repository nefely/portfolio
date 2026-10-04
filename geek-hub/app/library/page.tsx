import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { LibraryView } from "@/components/library/LibraryView";
import { requireUser } from "@/lib/auth/dal";
import { fetchEntries } from "@/lib/library/entries";
import { entriesOptions } from "@/lib/query/userData";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My library" };

export default async function LibraryPage() {
  const user = await requireUser("/library");
  const supabase = await createClient();
  const queryClient = new QueryClient();

  // Той самий ключ, що й у useMyEntries, але з серверним клієнтом: сторінка
  // приходить уже з даними, а картки каталогу далі беруть статуси з цього ж кешу.
  await queryClient.prefetchQuery({
    ...entriesOptions(user.id),
    queryFn: () => fetchEntries(supabase, user.id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LibraryView />
    </HydrationBoundary>
  );
}
