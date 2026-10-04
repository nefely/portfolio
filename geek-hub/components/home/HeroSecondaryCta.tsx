"use client";

import Link from "next/link";
import { Library } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useSessionUser } from "@/hooks/useSessionUser";
import { cn } from "@/lib/utils";

const CLASSES = buttonVariants({ size: "lg", variant: "outline", className: "h-11 px-5" });

// Головна статична (ISR) і не знає про сесію — кнопку під конкретного
// відвідувача вирішуємо на клієнті. Поки сесія читається, тримаємо місце
// невидимою кнопкою того ж розміру, щоб не було зсуву макета.
export function HeroSecondaryCta() {
  const { user, isPending } = useSessionUser();

  if (isPending) {
    return (
      <span aria-hidden className={cn(CLASSES, "invisible")}>
        Create free account
      </span>
    );
  }

  if (user) {
    return (
      <Link href="/library" className={CLASSES}>
        <Library /> My library
      </Link>
    );
  }

  return (
    <Link href="/signup" className={CLASSES}>
      Create free account
    </Link>
  );
}
