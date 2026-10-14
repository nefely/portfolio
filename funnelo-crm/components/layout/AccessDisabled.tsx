"use client";

import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/** Admin деактивував учасника: RLS уже нічого не віддає, пояснюємо чому. */
export function AccessDisabled({ email }: { email: string }) {
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="max-w-sm space-y-3 text-center">
        <Lock className="mx-auto size-8 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Access disabled</h1>
        <p className="text-sm text-muted-foreground">
          The account <span className="font-medium text-foreground">{email}</span> was deactivated
          by an admin. Ask them to restore your access.
        </p>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
