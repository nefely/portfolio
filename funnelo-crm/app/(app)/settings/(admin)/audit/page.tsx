import type { Metadata } from "next";
import { Suspense } from "react";
import { AuditLog } from "@/components/settings/AuditLog";

export const metadata: Metadata = { title: "Audit log" };

export default function AuditPage() {
  return (
    <Suspense>
      <AuditLog />
    </Suspense>
  );
}
