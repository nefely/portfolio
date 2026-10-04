import { Skeleton } from "@/components/ui/skeleton";

export default function AnimeLoading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:flex-row sm:px-6" aria-busy>
      <Skeleton className="mx-auto aspect-2/3 w-48 rounded-2xl sm:mx-0 sm:w-56" />
      <div className="flex-1 space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-12 w-full max-w-md" />
        <Skeleton className="h-9 w-64" />
      </div>
    </div>
  );
}
