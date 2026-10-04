import { Skeleton } from "@/components/ui/skeleton";
import { GRID_CLASSES } from "@/components/anime/AnimeGrid";

export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-busy>
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-2 h-5 w-96 max-w-full" />
      <Skeleton className="mt-6 h-10 w-full" />
      <div className={`mt-6 ${GRID_CLASSES}`}>
        {Array.from({ length: 18 }, (_, index) => (
          <Skeleton key={index} className="aspect-2/3 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
