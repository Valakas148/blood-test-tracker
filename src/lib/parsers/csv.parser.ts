import Papa from "papaparse";
import { getBiomarkerStatus } from "@/lib/validators/biomarker.validator";
import type { Biomarker } from "@/types";

function isFiniteNumber(value: string) {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed);
}

export function parseCSV(text: string): Biomarker[] {
  const parsed = Papa.parse<string[]>(text, {
    skipEmptyLines: true,
  });
  const rows = parsed.data;
  if (rows.length <= 1) return [];

  const dataRows = rows.slice(1);
  const biomarkers: Biomarker[] = [];

  for (const row of dataRows) {
    const columns = row.map((cell) => String(cell).trim());
    if (columns.length < 5) continue;

    const [name, valueRaw, unit, minRaw, maxRaw] = columns;
    if (!name || !unit) continue;
    if (!isFiniteNumber(valueRaw) || !isFiniteNumber(minRaw) || !isFiniteNumber(maxRaw)) {
      continue;
    }

    const value = Number(valueRaw);
    const min = Number(minRaw);
    const max = Number(maxRaw);

    biomarkers.push({
      id: crypto.randomUUID(),
      name,
      value,
      unit,
      referenceRange: { min, max },
      status: getBiomarkerStatus(value, { min, max }),
    });
  }

  return biomarkers;
}
