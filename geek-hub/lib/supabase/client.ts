import { createBrowserClient } from "@supabase/ssr";

// Браузерний клієнт для "use client"-коду. createBrowserClient сам тримає
// синглтон у браузері, тож виклик у кожному хуку не створює нових з'єднань.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
