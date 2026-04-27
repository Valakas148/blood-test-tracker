"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity } from "lucide-react";
import Header from "@/components/layout/Header";
import { BiomarkerSelector, TrendChart } from "@/components/trends";
import { Card, EmptyState, Spinner } from "@/components/ui";
import { useTrends } from "@/hooks/useTrends";
import shellStyles from "@/styles/page-shell.module.scss";
import styles from "./page.module.scss";

const CHART_COLORS = ["#2563EB", "#9333EA", "#EA580C", "#0891B2"];

export default function TrendsPage() {
  const { trends, isLoading, hasEnoughData } = useTrends();
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedNamesState, setSelectedNamesState] = useState<string[]>([]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("selectedTrends");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
            setSelectedNamesState(parsed);
          }
        }
      } catch {
        setSelectedNamesState([]);
      } finally {
        setIsHydrated(true);
      }
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedNamesState(newSelection);
    window.localStorage.setItem("selectedTrends", JSON.stringify(newSelection));
  };

  const selectableNames = useMemo(
    () => trends.filter((trend) => trend.dataPoints.length >= 2).map((trend) => trend.name),
    [trends]
  );

  const selectedNames = useMemo(() => {
    if (!isHydrated) return [];
    if (selectedNamesState.length > 0) {
      return selectedNamesState.filter((name) => selectableNames.includes(name));
    }
    return selectableNames.length > 0 ? [selectableNames[0]] : [];
  }, [isHydrated, selectedNamesState, selectableNames]);

  const visibleTrends = useMemo(
    () =>
      trends.filter(
        (trend) => trend.dataPoints.length >= 2 && selectedNames.includes(trend.name)
      ),
    [trends, selectedNames]
  );

  return (
    <section className={shellStyles.page}>
      <Header title="Trends" subtitle="Track your biomarkers over time" />
      <div className={`${shellStyles.section} ${styles.section}`}>
        {isLoading ? (
          <div className={styles.loading}>
            <Spinner />
          </div>
        ) : null}

        {!isLoading && isHydrated && !hasEnoughData ? (
          <EmptyState
            icon={<Activity className={styles.icon} />}
            title="Not enough data for trends"
            description="Add at least two test results for the same biomarker to see changes over time."
          />
        ) : null}

        {!isLoading && isHydrated && hasEnoughData ? (
          <>
            <Card className={styles.selectorCard}>
              <BiomarkerSelector
                options={selectableNames}
                selected={selectedNames}
                onChange={handleSelectionChange}
              />
            </Card>

            {visibleTrends.length === 0 ? (
              <EmptyState
                title="No biomarkers selected"
                description="Choose one or more biomarkers to display trend charts."
              />
            ) : (
              <div className={styles.charts}>
                {visibleTrends.map((trend, index) => (
                  <Card key={trend.name} className={styles.chartCard}>
                    <TrendChart trend={trend} color={CHART_COLORS[index % CHART_COLORS.length]} />
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}