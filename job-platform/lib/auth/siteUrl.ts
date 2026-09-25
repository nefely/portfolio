import "server-only";

import { headers } from "next/headers";

// Базовий URL для посилань, які Supabase вставляє в лист / куди повертає
// після Google. Site URL у налаштуваннях Supabase спільний з task-manager,
// тож redirectTo завжди передаємо явно. NEXT_PUBLIC_SITE_URL — для проду;
// локально вистачає Origin-заголовка запиту.
export async function getSiteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin) return origin;

  const host = headerStore.get("host");
  return host ? `http://${host}` : "http://localhost:3000";
}
