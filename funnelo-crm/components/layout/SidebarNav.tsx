"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMe } from "@/components/providers/MeProvider";
import { isAdmin } from "@/lib/permissions";
import { dueTodayOptions } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import { ACCOUNT_NAV, ADMIN_NAV, MAIN_NAV, type NavItem, isActive } from "./navItems";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const me = useMe();
  const pathname = usePathname();
  // Той самий запит, що й блок "Due today" на дашборді — кеш спільний.
  const { data: due = [] } = useQuery(dueTodayOptions(me.user_id));

  const link = (item: NavItem, badge?: number) => {
    const active = isActive(pathname, item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
        {badge ? (
          <span className="rounded-full bg-primary px-1.5 text-[11px] leading-[18px] font-semibold text-primary-foreground tabular-nums">
            {badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <nav className="flex flex-1 flex-col gap-6" aria-label="Main">
      <div className="grid gap-0.5">
        {MAIN_NAV.map((item) => link(item, item.href === "/activities" ? due.length : undefined))}
      </div>

      {isAdmin(me) && (
        <div className="grid gap-0.5">
          <p className="px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Admin
          </p>
          {ADMIN_NAV.map((item) => link(item))}
        </div>
      )}

      <div className="mt-auto grid gap-0.5">{link(ACCOUNT_NAV)}</div>
    </nav>
  );
}
