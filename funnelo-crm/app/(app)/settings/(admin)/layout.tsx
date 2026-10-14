import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/dal";
import { isAdmin } from "@/lib/permissions";

// Сторінки керування (команда, воронка, журнал) — лише для admin. Це
// зручність UI: навіть відкривши їх, user нічого б не побачив і не змінив —
// funnelo_audit_log і запис у етапи/ролі закриває RLS.
export default async function AdminLayout({ children }: LayoutProps<"/settings">) {
  const me = await requireProfile("/settings");
  if (!isAdmin(me)) redirect("/settings");
  return children;
}
