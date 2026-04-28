import { describe, expect, it } from "vitest";
import { areBiomarkersEqual } from "@/lib/utils/areBiomarkersEqual";
import type { Biomarker } from "@/types";

function biomarker(overrides: Partial<Biomarker> = {}): Biomarker {
  return {
    id: "b1",
    name: "Hemoglobin",
    value: 13.2,
    unit: "g/dL",
    referenceRange: { min: 12, max: 16 },
    status: "normal",
    ...overrides,
  };
}

describe("areBiomarkersEqual", () => {
  it("returns true for deeply equal arrays in the same order", () => {
    const left = [biomarker(), biomarker({ id: "b2", name: "Ferritin", value: 90 })];
    const right = [biomarker(), biomarker({ id: "b2", name: "Ferritin", value: 90 })];

    expect(areBiomarkersEqual(left, right)).toBe(true);
  });

  it("returns false for arrays with different lengths", () => {
    expect(areBiomarkersEqual([biomarker()], [])).toBe(false);
  });

  it("returns false when order differs", () => {
    const first = biomarker({ id: "b1", name: "Hemoglobin" });
    const second = biomarker({ id: "b2", name: "Ferritin" });

    expect(areBiomarkersEqual([first, second], [second, first])).toBe(false);
  });

  it("returns false when any tracked field differs", () => {
    const left = [biomarker()];
    const right = [biomarker({ value: 14.1 })];

    expect(areBiomarkersEqual(left, right)).toBe(false);
  });
});
