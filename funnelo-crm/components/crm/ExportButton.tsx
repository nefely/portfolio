"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { type CsvColumn, downloadCsv, toCsv } from "@/lib/csv";
import { todayIso } from "@/lib/format";

/** Експорт усіх рядків поточного фільтра (не лише видимої сторінки). */
export function ExportButton<T>({
  filename,
  fetchRows,
  columns,
}: {
  filename: string;
  fetchRows: () => Promise<T[]>;
  columns: CsvColumn<T>[];
}) {
  const [pending, setPending] = useState(false);

  async function handleExport() {
    setPending(true);
    try {
      const rows = await fetchRows();
      downloadCsv(`${filename}-${todayIso()}.csv`, toCsv(rows, columns));
      toast.success(`Exported ${rows.length} row${rows.length === 1 ? "" : "s"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={pending}>
      <Download /> {pending ? "Exporting…" : "Export CSV"}
    </Button>
  );
}
