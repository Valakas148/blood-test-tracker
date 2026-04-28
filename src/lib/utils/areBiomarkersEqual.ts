import type { Biomarker } from "@/types";

export function areBiomarkersEqual(left: Biomarker[], right: Biomarker[]) {
  if (left.length !== right.length) return false;
  return left.every((biomarker, index) => {
    const other = right[index];
    if (!other) return false;
    return (
      biomarker.id === other.id &&
      biomarker.name === other.name &&
      biomarker.value === other.value &&
      biomarker.unit === other.unit &&
      biomarker.status === other.status &&
      biomarker.referenceRange.min === other.referenceRange.min &&
      biomarker.referenceRange.max === other.referenceRange.max
    );
  });
}
