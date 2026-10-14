export type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

/**
 * RFC 4180: поля з комою, лапками чи переносом рядка — у лапках, лапки
 * подвоюються. Значення, що починаються з = + - @, Excel виконав би як
 * формулу (CSV injection) — їх екрануємо апострофом. Числа лишаємо як є.
 */
export function escapeCsvCell(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]) {
  const header = columns.map((column) => escapeCsvCell(column.header)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => escapeCsvCell(column.value(row))).join(","),
  );
  return [header, ...body].join("\r\n");
}

export function downloadCsv(filename: string, csv: string) {
  // BOM — щоб Excel відкрив UTF-8 (імена з діакритикою) без "кракозябр".
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
