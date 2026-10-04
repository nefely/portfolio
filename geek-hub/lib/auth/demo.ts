// Публічний демо-акаунт для відвідувачів портфоліо. Створюється скриптом
// supabase/demo-account.sql (генерує supabase/generate-demo.mjs — там ті самі
// дані; при зміні оновити обидва місця). Секрету тут немає: дані навмисно
// відкриті, а RLS обмежує акаунт лише його власними даними.
export const DEMO_ACCOUNT = {
  email: "demo@geekhub.test",
  password: "GeekHub-demo-2026",
} as const;
