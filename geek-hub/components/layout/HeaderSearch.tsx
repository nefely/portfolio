"use client";

import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Неконтрольований інпут: значення читаємо з FormData лише на submit, тож
// набір тексту не викликає жодного ререндера.
export function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();

  // У каталозі є власний пошук із фільтрами — дубль у хедері лише заважає.
  if (pathname === "/anime") return null;

  return (
    <form
      role="search"
      className="relative hidden sm:block"
      onSubmit={(event) => {
        event.preventDefault();
        const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
        router.push(q ? `/anime?q=${encodeURIComponent(q)}` : "/anime");
      }}
    >
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name="q"
        type="search"
        placeholder="Search anime…"
        aria-label="Search anime"
        className="h-9 w-52 pl-8 lg:w-64"
      />
    </form>
  );
}
