"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const REDIRECT_FROM = new Set(["/", "/login", "/signup"]);

// Mounted once in the root layout. Its only job is to notice when Supabase
// finishes parsing an auth link (e.g. an email-confirmation redirect that
// lands with tokens in the URL hash) and bounce the user to the board —
// this covers Supabase project configurations that use the implicit/hash
// flow instead of the token_hash/code flow handled by /auth/confirm.
export default function SessionListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && REDIRECT_FROM.has(pathname)) {
        router.replace("/board");
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}
