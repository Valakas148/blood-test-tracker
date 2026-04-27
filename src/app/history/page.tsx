"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import type { DateRange } from "react-day-picker";
import Header from "@/components/layout/Header";
import TestCard from "@/components/history/TestCard";
import { EmptyState, Spinner } from "@/components/ui";
import { useBloodTests } from "@/hooks/useBloodTests";
import { filterAndSortBloodTests, type SortOption } from "@/lib/history/filters";
import shellStyles from "@/styles/page-shell.module.scss";
import HistoryFilters from "./HistoryFilters";
import styles from "./page.module.scss";
import "react-day-picker/dist/style.css";

export default function HistoryPage() {
  const bloodTestsQuery = useBloodTests();
  const [sortBy, setSortBy] = useState<SortOption>("date_desc");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filteredTests = useMemo(() => {
    return filterAndSortBloodTests(bloodTestsQuery.data ?? [], dateRange, sortBy);
  }, [bloodTestsQuery.data, dateRange, sortBy]);

  return (
    <section className={shellStyles.page}>
      <Header title="Test History" subtitle="All your uploaded lab reports" />
      <div className={`${shellStyles.section} ${styles.section}`}>
        <HistoryFilters
          sortBy={sortBy}
          onSortChange={setSortBy}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onClear={() => {
            setSortBy("date_desc");
            setDateRange(undefined);
          }}
        />

        {bloodTestsQuery.isLoading ? (
          <div className={styles.loading}>
            <Spinner />
          </div>
        ) : null}

        {!bloodTestsQuery.isLoading && filteredTests.length === 0 ? (
          <EmptyState
            title="No blood tests yet"
            description={
              (bloodTestsQuery.data?.length ?? 0) === 0
                ? "Upload your first lab report to get started"
                : "No records match your current date filter."
            }
            icon={<ClipboardList className={styles.clipboardIcon} />}
            action={
              <Link href="/upload" className={styles.emptyAction}>
                Go to Upload
              </Link>
            }
          />
        ) : null}

        {!bloodTestsQuery.isLoading && filteredTests.length > 0 ? (
          <div className={styles.grid}>
            {filteredTests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}