import { Skeleton } from "@/components/skeleton";

export default function CompareLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8" aria-busy="true">
      <div className="mb-6 flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-surface-1">
        {Array.from({ length: 7 }, (_, row) => (
          <div key={row} className="grid grid-cols-[9rem_repeat(3,minmax(0,1fr))] gap-4 border-b border-line p-4 last:border-0">
            <Skeleton className="h-4 w-20" />
            {Array.from({ length: 3 }, (_, col) => (
              <Skeleton key={col} className={row === 0 ? "h-9 w-full" : "h-4 w-3/4"} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
