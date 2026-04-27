export type BiomarkerStatus = "normal" | "low" | "high";

export interface ReferenceRange {
  min: number;
  max: number;
}

export interface Biomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  referenceRange: ReferenceRange;
  status: BiomarkerStatus;
}

export interface BloodTest {
  id: string;
  date: string;
  source: "pdf" | "image" | "csv" | "manual";
  fileName?: string;
  biomarkers: Biomarker[];
  notes?: string;
  createdAt: number;
}

export interface TrendDataPoint {
  date: string;
  rawDate: number;
  value: number;
  status: BiomarkerStatus;
}

export interface BiomarkerTrend {
  name: string;
  unit: string;
  referenceRange: ReferenceRange;
  dataPoints: TrendDataPoint[];
}
