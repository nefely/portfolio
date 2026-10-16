"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Library, ListVideo, LogOut, Settings } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSessionUser } from "@/hooks/useSessionUser";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// Пункти ≥44px заввишки, щоб у них легко влучити і пальцем, і курсором.
const ITEM_CLASS = "min-h-11 gap-3 px-3 py-2.5 text-base";
const ICON_CLASS = "size-5";
const AUTH_LINK_CLASS = "h-10 px-3 text-sm";

export function UserMenu() {
  const { user, isPending } = useSessionUser();
  const router = useRouter();

  if (isPending) return <Skeleton className="size-11 rounded-full" />;

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), AUTH_LINK_CLASS)}
        >
          Sign in
        </Link>
        <Link href="/signup" className={cn(buttonVariants({ size: "sm" }), AUTH_LINK_CLASS)}>
          Sign up
        </Link>
      </div>
    );
  }

  const initial = (user.email?.[0] ?? "?").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="-mr-1.5 size-11 rounded-full"
            aria-label="Account menu"
          />
        }
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/20 text-sm text-primary">{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate px-3 py-2 text-sm">{user.email}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className={ITEM_CLASS} render={<Link href="/library" />}>
          <Library className={ICON_CLASS} /> Library
        </DropdownMenuItem>
        <DropdownMenuItem className={ITEM_CLASS} render={<Link href="/lists" />}>
          <ListVideo className={ICON_CLASS} /> My lists
        </DropdownMenuItem>
        <DropdownMenuItem className={ITEM_CLASS} render={<Link href="/settings" />}>
          <Settings className={ICON_CLASS} /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={ITEM_CLASS}
          variant="destructive"
          onClick={async () => {
            // AuthListener підхопить SIGNED_OUT: почистить кеш і оновить RSC.
            await createClient().auth.signOut();
            router.push("/");
          }}
        >
          <LogOut className={ICON_CLASS} /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
