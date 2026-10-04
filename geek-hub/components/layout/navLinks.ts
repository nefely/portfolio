import { Compass, Library, ListVideo, type LucideIcon } from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/anime", label: "Browse", icon: Compass },
  { href: "/library", label: "Library", icon: Library },
  { href: "/lists", label: "Lists", icon: ListVideo },
];

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
