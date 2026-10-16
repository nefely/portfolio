import type { AccountRole } from "@/types/account";

// Публічні демо-акаунти для відвідувачів портфоліо. Створює їх
// supabase/demo-accounts.sql — при зміні оновити обидва місця. Секрету тут
// немає: дані навмисно відкриті, а RLS обмежує, що кожна роль може змінювати.
export const DEMO_PASSWORD = "VVwork-demo-2026";

export const DEMO_ACCOUNTS: readonly { role: AccountRole; email: string }[] = [
  { role: "employer", email: "employer@demo.vvwork.test" },
  { role: "seeker", email: "seeker@demo.vvwork.test" },
];
