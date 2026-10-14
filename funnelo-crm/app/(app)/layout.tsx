import { AppShell } from "@/components/layout/AppShell";
import { AccessDisabled } from "@/components/layout/AccessDisabled";
import { MeProvider } from "@/components/providers/MeProvider";
import { requireProfile } from "@/lib/auth/dal";

// Єдина серверна точка, що знає "хто це": профіль (з роллю) читаємо тут один
// раз і кладемо в контекст. Сторінки під цим layout — клієнтські й беруть
// дані через TanStack Query напряму з Supabase (RLS вирішує, що видно).
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const me = await requireProfile("/dashboard");

  if (!me.is_active) return <AccessDisabled email={me.email} />;

  return (
    <MeProvider me={me}>
      <AppShell>{children}</AppShell>
    </MeProvider>
  );
}
