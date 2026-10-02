import { SiteGridSkeleton, Skeleton } from "@/components/skeleton";

export default function NicheLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8" aria-busy="true">
      <Skeleton className="h-4 w-24" />
      <div className="mt-4 flex flex-col gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-9 w-72 max-w-full" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border border-line bg-surface-1 p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-line bg-surface-1 p-4 sm:p-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-3 w-72 max-w-full" />
        <div className="mt-6 flex h-52 items-end gap-0.5">
          {Array.from({ length: 23 }, (_, i) => (
            <Skeleton key={i} className="flex-1 rounded-b-none" style={{ height: `${30 + ((i * 37) % 60)}%` }} />
          ))}
        </div>
      </div>
      <div className="mt-12">
        <Skeleton className="mb-4 h-6 w-56" />
        <SiteGridSkeleton count={3} />
      </div>
    </div>
  );
}
