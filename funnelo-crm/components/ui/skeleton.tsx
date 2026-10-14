import { cn } from "cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      // Колір — частка від кольору тексту, а не bg-muted: muted майже
      // зливається з білою карткою у світлій темі. Так заглушку видно і на
      // картці, і на фоні сторінки, в обох темах.
      // skeleton-shimmer (globals.css) замість animate-pulse: "відблиск", що біжить
      // по заглушці, читається як завантаження краще за миготіння.
      className={cn(
        "skeleton-shimmer rounded-md bg-[color-mix(in_oklch,var(--foreground)_9%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
