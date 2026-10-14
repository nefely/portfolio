import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Клієнт для Server Components / Route Handlers / Server Actions. Читає
// сесію з cookies, тож RLS бачить залогіненого користувача (auth.uid()).
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
            // Виклик із Server Component під час рендера, де cookies писати
            // не можна. Безпечно: proxy.ts оновлює сесію на кожному запиті.
          }
        },
      },
    },
  );
}
