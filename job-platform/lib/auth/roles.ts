import type { AccountRole } from "@/types/account";

export const ACCOUNT_ROLES: AccountRole[] = ["seeker", "employer"];

export function isAccountRole(value: unknown): value is AccountRole {
  return typeof value === "string" && (ACCOUNT_ROLES as string[]).includes(value);
}
