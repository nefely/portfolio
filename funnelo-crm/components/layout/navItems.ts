import {
  Building2,
  CalendarCheck,
  History,
  KanbanSquare,
  LayoutDashboard,
  Settings,
  SlidersHorizontal,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/deals", label: "Deals", icon: KanbanSquare },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/activities", label: "Activities", icon: CalendarCheck },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/settings/team", label: "Team", icon: UsersRound },
  { href: "/settings/pipeline", label: "Pipeline", icon: SlidersHorizontal },
  { href: "/settings/audit", label: "Audit log", icon: History },
];

export const ACCOUNT_NAV: NavItem = { href: "/settings", label: "Settings", icon: Settings };

export function isActive(pathname: string, href: string) {
  if (href === "/settings") return pathname === "/settings";
  return pathname === href || pathname.startsWith(`${href}/`);
}
