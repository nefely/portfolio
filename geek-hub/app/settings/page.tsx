import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { requireUser } from "@/lib/auth/dal";
import { fetchProfile } from "@/lib/library/profiles";
import { profileOptions } from "@/lib/query/userData";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser("/settings");
  const supabase = await createClient();
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    ...profileOptions(user.id),
    queryFn: () => fetchProfile(supabase, user.id),
  });

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-muted-foreground">
        This is how other fans see you next to your reviews and public lists.
      </p>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProfileForm userId={user.id} email={user.email ?? ""} />
      </HydrationBoundary>
    </div>
  );
}
