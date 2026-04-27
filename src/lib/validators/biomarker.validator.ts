import type { BiomarkerStatus, ReferenceRange } from "@/types";

export function getBiomarkerStatus(
  value: number,
  range: ReferenceRange
): BiomarkerStatus {
  if (value < range.min) return "low";
  if (value > range.max) return "high";
  return "normal";
}
