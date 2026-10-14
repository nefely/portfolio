import { describe, expect, it } from "vitest";
import { escapeCsvCell, toCsv } from "./csv";

describe("escapeCsvCell", () => {
  it("leaves plain values and numbers alone", () => {
    expect(escapeCsvCell("Acme")).toBe("Acme");
    expect(escapeCsvCell(-1200)).toBe("-1200");
    expect(escapeCsvCell(null)).toBe("");
  });

  it("quotes commas, quotes and newlines", () => {
    expect(escapeCsvCell("Maple & Co, Retail")).toBe('"Maple & Co, Retail"');
    expect(escapeCsvCell('The "big" one')).toBe('"The ""big"" one"');
    expect(escapeCsvCell("line\nbreak")).toBe('"line\nbreak"');
  });

  it("neutralises spreadsheet formulas", () => {
    expect(escapeCsvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
    expect(escapeCsvCell("+1 (555) 123")).toBe("'+1 (555) 123");
  });
});

describe("toCsv", () => {
  it("builds a header and rows", () => {
    const csv = toCsv(
      [{ name: "Acme", value: 10 }],
      [
        { header: "Name", value: (row) => row.name },
        { header: "Value", value: (row) => row.value },
      ],
    );
    expect(csv).toBe("Name,Value\r\nAcme,10");
  });
});
