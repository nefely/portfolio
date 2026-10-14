"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PersonAvatar } from "@/components/crm/PersonAvatar";
import { useMe } from "@/components/providers/MeProvider";
import { createClient } from "@/lib/supabase/client";

export function UserMenu() {
  const me = useMe();
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    // Кеш попереднього користувача чистить AuthListener (подія SIGNED_OUT).
    router.replace("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="Account menu"
      >
        <PersonAvatar person={me} size="md" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {/* Шапка меню — звичайний div: DropdownMenuLabel (base-ui GroupLabel)
            працює лише всередині Menu.Group і без неї падає. */}
        <div className="space-y-0.5 px-2 py-1.5 text-xs text-muted-foreground">
          <span className="block text-sm font-medium text-foreground">{me.full_name}</span>
          <span className="block truncate">{me.email}</span>
          <span className="mt-1 inline-block rounded-full bg-muted px-1.5 text-[10px] font-semibold tracking-wide uppercase">
            {me.role}
          </span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
