"use client";

import { createContext, use, type ReactNode } from "react";
import type { Profile } from "@/types/crm";

// Профіль поточного користувача приходить із серверного layout (app/(app)/layout.tsx)
// і не змінюється протягом сесії — тож це контекст, а не запит. Після зміни
// власного профілю досить router.refresh(): layout перечитає його на сервері.
const MeContext = createContext<Profile | null>(null);

export function MeProvider({ me, children }: { me: Profile; children: ReactNode }) {
  return <MeContext value={me}>{children}</MeContext>;
}

export function useMe() {
  const me = use(MeContext);
  if (!me) throw new Error("useMe() must be used inside <MeProvider>");
  return me;
}
