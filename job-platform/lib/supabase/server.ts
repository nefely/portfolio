import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client for Server Components, Server Actions and Route Handlers.
// Reads the auth session from cookies, so RLS sees the signed-in user
// (auth.uid()). Same convention as portfolio/task-manager/src/lib/supabase/server.js.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` is called from a Server Component during rendering,
            // where cookies can't be written. Safe to ignore — proxy.ts
            // already refreshes the session on every request.
          }
        },
      },
    },
  );
}
