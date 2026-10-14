import type { Metadata } from "next";
import { Suspense } from "react";
import { DealsView } from "@/components/deals/DealsView";

export const metadata: Metadata = { title: "Deals" };

export default function DealsPage() {
  // DealsView читає фільтри з URL (useSearchParams) — потрібна межа Suspense.
  return (
    <Suspense>
      <DealsView />
    </Suspense>
  );
}
