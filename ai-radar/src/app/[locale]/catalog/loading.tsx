import { SiteGridSkeleton, Skeleton } from "@/components/skeleton";

export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8" aria-busy="true">
      <div className="mb-6 flex flex-col gap-2">
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-xl border border-line bg-surface-1 p-4">
          <Skeleton className="h-6 w-full lg:hidden" />
          <div className="hidden flex-col gap-4 lg:flex">
            <Skeleton className="h-4 w-20" />
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <SiteGridSkeleton count={9} />
      </div>
    </div>
  );
}
