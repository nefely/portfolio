// Контракт кешу TanStack Query: ключі в одному місці, без server-only /
// client-only імпортів — їх використовують і серверний prefetch, і хуки.
// Користувацькі ключі містять userId, тож дані одного акаунта ніколи не
// покажуться іншому після зміни сесії в тій самій вкладці.

export const queryKeys = {
  animeSearch: (filtersKey: string) => ["anime", "search", filtersKey] as const,
  sessionUser: ["auth", "user"] as const,
  entries: (userId: string) => ["user", userId, "entries"] as const,
  lists: (userId: string) => ["user", userId, "lists"] as const,
  profile: (userId: string) => ["user", userId, "profile"] as const,
  myReview: (userId: string, animeId: number) => ["user", userId, "review", animeId] as const,
  list: (id: string) => ["list", id] as const,
  reviews: (animeId: number) => ["reviews", animeId] as const,
};
