import { afterEach, describe, expect, it, vi } from "vitest";
import { parseCSV } from "@/lib/parsers/csv.parser";

describe("parseCSV", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses valid rows and computes biomarker status", () => {
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce("uuid-1")
      .mockReturnValueOnce("uuid-2");

    const csv = [
      "name,value,unit,min,max",
      "Hemoglobin,13.4,g/dL,12,16",
      "Ferritin,9,ng/mL,15,150",
    ].join("\n");

    const result = parseCSV(csv);

    expect(result).toEqual([
      {
        id: "uuid-1",
        name: "Hemoglobin",
        value: 13.4,
        unit: "g/dL",
        referenceRange: { min: 12, max: 16 },
        status: "normal",
      },
      {
        id: "uuid-2",
        name: "Ferritin",
        value: 9,
        unit: "ng/mL",
        referenceRange: { min: 15, max: 150 },
        status: "low",
      },
    ]);
  });

  it("skips invalid or incomplete rows", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("uuid-1");

    const csv = [
      "name,value,unit,min,max",
      "Glucose,95,mg/dL,70,100",
      "BrokenNoMin,95,mg/dL,,100",
      "BrokenValue,abc,mg/dL,70,100",
      "TooShort,1,mg/dL,70",
    ].join("\n");

    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result.map((row) => row.name)).toEqual(["Glucose", "BrokenNoMin"]);
  });

  it("returns empty array for header-only csv", () => {
    expect(parseCSV("name,value,unit,min,max")).toEqual([]);
  });

  it("handles quoted commas in fields", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("uuid-1");

    const csv = ['name,value,unit,min,max', '"Vitamin D, total",40,ng/mL,30,100'].join("\n");
    const result = parseCSV(csv);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "uuid-1",
      name: "Vitamin D, total",
      status: "normal",
    });
  });
});
