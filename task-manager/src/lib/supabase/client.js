import { createBrowserClient } from "@supabase/ssr";

// Supabase client for use in Client Components / the browser. It shares its
// session with the server via cookies, so a user who logs in stays logged in
// across server components, route handlers and this client alike.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
