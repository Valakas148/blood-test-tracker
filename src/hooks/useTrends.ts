"use client";

import { useMemo } from "react";
import { useBloodTests } from "./useBloodTests";
import type { BiomarkerTrend } from "@/types";

function normalizeBiomarkerName(name: string) {
  return name.trim().toLowerCase();
}

function getAnalysisTimestamp(date: string) {
  const parsed = new Date(date).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function formatTrendDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function useTrends(): {
  trends: BiomarkerTrend[];
  biomarkerNames: string[];
  isLoading: boolean;
  hasEnoughData: boolean;
} {
  const { data: tests = [], isLoading } = useBloodTests();

  const trends = useMemo(() => {
    const trendsMap = new Map<string, BiomarkerTrend>();
    const sortedTests = [...tests]
      .map((test) => ({ test, analysisTimestamp: getAnalysisTimestamp(test.date) }))
      .filter(
        (entry): entry is { test: (typeof tests)[number]; analysisTimestamp: number } =>
          entry.analysisTimestamp !== null
      )
      .sort((a, b) => a.analysisTimestamp - b.analysisTimestamp);

    for (const { test, analysisTimestamp } of sortedTests) {
      for (const biomarker of test.biomarkers) {
        const normalizedName = normalizeBiomarkerName(biomarker.name);
        if (!normalizedName) continue;

        if (!trendsMap.has(normalizedName)) {
          trendsMap.set(normalizedName, {
            name: biomarker.name.trim(),
            unit: biomarker.unit,
            referenceRange: biomarker.referenceRange,
            dataPoints: [],
          });
        }

        const trend = trendsMap.get(normalizedName);
        if (!trend) continue;

        trend.name = biomarker.name.trim();
        trend.unit = biomarker.unit;
        trend.referenceRange = biomarker.referenceRange;
        trend.dataPoints.push({
          date: formatTrendDate(analysisTimestamp),
          rawDate: analysisTimestamp,
          value: biomarker.value,
          status: biomarker.status,
        });
      }
    }

    return Array.from(trendsMap.values());
  }, [tests]);

  const hasEnoughData = useMemo(
    () => trends.some((trend) => trend.dataPoints.length >= 2),
    [trends]
  );

  return {
    trends,
    biomarkerNames: trends.map((trend) => trend.name),
    isLoading,
    hasEnoughData,
  };
}
