import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="size-4" />
      {label}
    </Link>
  );
}

export function DetailCard({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card">
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </header>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

/** Рядок "мітка — значення" у бічних картках деталей. */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] items-baseline gap-3 py-1.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">
        {children ?? <span className="text-muted-foreground">—</span>}
      </dd>
    </div>
  );
}

/**
 * Скелетон сторінки запису (угода / компанія / контакт): заголовок, мета-рядок,
 * таймлайн ліворуч і картка деталей праворуч — та сама сітка, що й у вмісті.
 */
export function DetailSkeleton() {
  return (
    <div aria-busy aria-label="Loading" className="space-y-6">
      <Skeleton className="h-4 w-20" />
      <div className="space-y-2.5">
        <Skeleton className="h-8 w-full max-w-md" />
        <div className="flex gap-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
      <Skeleton className="h-10 rounded-lg" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-7 w-36" />
          </div>
          <div className="divide-y px-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex gap-3 py-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-4" style={{ width: `${68 - index * 10}%` }} />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-card">
          <div className="border-b px-4 py-3">
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-3 px-4 py-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="grid grid-cols-[7.5rem_1fr] gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4" style={{ width: `${80 - index * 9}%` }} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function NotFoundCard({
  backHref,
  backLabel,
  what,
}: {
  backHref: string;
  backLabel: string;
  what: string;
}) {
  return (
    <div className="mx-auto max-w-md space-y-3 py-20 text-center">
      <h1 className="text-xl font-semibold">This {what} doesn’t exist</h1>
      <p className="text-sm text-muted-foreground">It may have been deleted by a teammate.</p>
      <BackLink href={backHref} label={backLabel} />
    </div>
  );
}
