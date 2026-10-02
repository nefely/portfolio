import { SectionHeaderSkeleton, SiteGridSkeleton, Skeleton } from "@/components/skeleton";

export default function HomeLoading() {
  return (
    <div aria-busy="true">
      <section className="border-b border-line">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 pb-14 pt-14 sm:pb-16 sm:pt-24">
          <Skeleton className="h-6 w-48 rounded-full" />
          <Skeleton className="h-10 w-full max-w-xl sm:h-12" />
          <Skeleton className="h-10 w-3/4 max-w-md sm:h-12" />
          <Skeleton className="mt-2 h-5 w-full max-w-lg" />
          <Skeleton className="h-5 w-2/3 max-w-md" />
          <Skeleton className="mt-6 h-12 w-full max-w-2xl rounded-xl" />
        </div>
      </section>
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 pt-10 sm:pt-12">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-xl border border-line bg-surface-1 p-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        <section>
          <SectionHeaderSkeleton />
          <SiteGridSkeleton />
        </section>
      </div>
    </div>
  );
}
