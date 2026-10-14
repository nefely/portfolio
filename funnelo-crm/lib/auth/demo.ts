// Публічні демо-акаунти для відвідувачів портфоліо. Створює їх
// supabase/demo-data.sql — при зміні оновити обидва місця. Секрету тут немає:
// дані навмисно відкриті, а RLS обмежує, що кожна роль може змінювати.
export const DEMO_PASSWORD = "Funnelo-demo-2026";

export const DEMO_ACCOUNTS = [
  {
    role: "admin",
    email: "admin@funnelo.test",
    name: "Alex Morgan",
    description: "Head of Sales: full access, team & pipeline settings, audit log",
  },
  {
    role: "user",
    email: "user@funnelo.test",
    name: "Jamie Carter",
    description: "Account Executive: sees everything, edits own records",
  },
] as const;
