import type { DateRange } from "react-day-picker";
import type { BloodTest } from "@/types";

export type SortOption = "date_desc" | "date_asc";

const SORT_OPTIONS = new Set<SortOption>(["date_desc", "date_asc"]);

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
}

export function isSortOption(value: string): value is SortOption {
  return SORT_OPTIONS.has(value as SortOption);
}

export function formatHistoryDate(date?: Date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function filterAndSortBloodTests(
  tests: BloodTest[],
  dateRange: DateRange | undefined,
  sortBy: SortOption
) {
  const fromTimestamp = dateRange?.from ? startOfDay(dateRange.from) : null;
  const toTimestamp = dateRange?.to ? endOfDay(dateRange.to) : null;

  const filtered = tests.filter((test) => {
    const timestamp = new Date(test.date).getTime();
    if (fromTimestamp !== null && timestamp < fromTimestamp) return false;
    if (toTimestamp !== null && timestamp > toTimestamp) return false;
    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    if (sortBy === "date_asc") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return sorted;
}
