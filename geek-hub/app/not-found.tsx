import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="text-gradient text-7xl font-black">404</p>
      <h1 className="mt-4 text-2xl font-bold">This page went to another isekai</h1>
      <p className="mt-2 text-muted-foreground">
        It doesn&apos;t exist, or it&apos;s a private list you can&apos;t see.
      </p>
      <Link href="/anime" className={buttonVariants({ className: "mt-6" })}>
        Browse anime
      </Link>
    </div>
  );
}
