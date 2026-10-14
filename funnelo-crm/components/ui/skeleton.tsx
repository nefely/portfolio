import { cn } from "cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      // shimmer (globals.css) замість animate-pulse: "відблиск", що біжить
      // по заглушці, читається як завантаження краще за миготіння.
      className={cn("shimmer rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
