import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/dashboard" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}
    >
      <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 32 32" className="size-4" aria-hidden>
          <path d="M8 9h16l-6 7.5V23l-4 2v-8.5z" fill="currentColor" />
        </svg>
      </span>
      Funnelo
    </Link>
  );
}
