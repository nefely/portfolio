// Роль в межах ЦЬОГО застосунку (job_platform_profiles.role) — не плутати
// з auth.users, яка спільна для всіх проєктів Supabase-інстансу.
export type AccountRole = "seeker" | "employer";

// Помилки форм кабінету рівня "вся форма" (не конкретне поле) — ключі
// перекладу в messages/*.json → account.errors.
export type AccountFormError = "forbidden" | "saveFailed" | "companyRequired";
