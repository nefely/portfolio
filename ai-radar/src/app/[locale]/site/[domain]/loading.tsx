import { SiteGridSkeleton, Skeleton } from "@/components/skeleton";

export default function SiteLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8" aria-busy="true">
      <Skeleton className="h-4 w-28" />
      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
          <div className="mt-2 flex gap-1.5">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface-1 p-5">
          <Skeleton className="mb-2 h-5 w-32" />
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface-1 p-5">
          <Skeleton className="mb-1 h-5 w-20" />
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex justify-between gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
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
