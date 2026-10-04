export const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;

// Стартовий username з email: "Jane.Doe+anime@x.com" → "jane_doe_4821".
// Суфікс робить колізії рідкісними; ensureProfile все одно повторює спробу.
export function usernameFromEmail(email: string | undefined, random: () => number = Math.random) {
  const base = (email?.split("@")[0] ?? "")
    .split("+")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18);
  const suffix = String(Math.floor(random() * 10_000)).padStart(4, "0");
  return `${base.length >= 3 ? base : "otaku"}_${suffix}`;
}
