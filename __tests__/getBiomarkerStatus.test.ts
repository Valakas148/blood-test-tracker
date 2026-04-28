import { describe, expect, it } from "vitest";
import { getBiomarkerStatus } from "@/lib/validators/biomarker.validator";

describe("getBiomarkerStatus", () => {
  const range = { min: 3.5, max: 5.5 };

  it("returns low when value is below minimum", () => {
    expect(getBiomarkerStatus(3.4, range)).toBe("low");
  });

  it("returns high when value is above maximum", () => {
    expect(getBiomarkerStatus(5.6, range)).toBe("high");
  });

  it("returns normal when value equals minimum", () => {
    expect(getBiomarkerStatus(3.5, range)).toBe("normal");
  });

  it("returns normal when value equals maximum", () => {
    expect(getBiomarkerStatus(5.5, range)).toBe("normal");
  });
});
