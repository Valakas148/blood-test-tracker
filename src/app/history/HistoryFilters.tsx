"use client";

import * as Popover from "@radix-ui/react-popover";
import * as Select from "@radix-ui/react-select";
import { ArrowDownWideNarrow, CalendarRange, Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { DayPicker, type DateRange } from "react-day-picker";
import { Button } from "@/components/ui";
import { formatHistoryDate, isSortOption, type SortOption } from "@/lib/history/filters";
import styles from "./page.module.scss";

interface HistoryFiltersProps {
  sortBy: SortOption;
  onSortChange: (nextSort: SortOption) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (nextDateRange: DateRange | undefined) => void;
  onClear: () => void;
}

export default function HistoryFilters({
  sortBy,
  onSortChange,
  dateRange,
  onDateRangeChange,
  onClear,
}: HistoryFiltersProps) {
  const hasActiveFilters = sortBy !== "date_desc" || Boolean(dateRange?.from) || Boolean(dateRange?.to);
  const hasDateRange = Boolean(dateRange?.from || dateRange?.to);
  const currentYear = new Date().getFullYear();

  const handleFromSelect = (from: Date | undefined) => {
    if (!from) {
      onDateRangeChange(dateRange?.to ? { from: undefined, to: dateRange.to } : undefined);
      return;
    }

    const nextTo = dateRange?.to;
    if (nextTo && from > nextTo) {
      onDateRangeChange({ from: nextTo, to: from });
      return;
    }

    onDateRangeChange({ from, to: nextTo });
  };

  const handleToSelect = (to: Date | undefined) => {
    if (!to) {
      onDateRangeChange(dateRange?.from ? { from: dateRange.from, to: undefined } : undefined);
      return;
    }

    const nextFrom = dateRange?.from;
    if (nextFrom && to < nextFrom) {
      onDateRangeChange({ from: to, to: nextFrom });
      return;
    }

    onDateRangeChange({ from: nextFrom, to });
  };

  return (
    <div className={styles.filtersBar}>
      <span className={styles.filtersLabel}>
        <SlidersHorizontal size={14} />
        Filters
      </span>
      <div className={styles.filters}>
        <label className={styles.filterField}>
          <span className={styles.fieldLabel}>Sort</span>
          <Select.Root
            value={sortBy}
            onValueChange={(value) => {
              if (isSortOption(value)) onSortChange(value);
            }}
          >
            <Select.Trigger className={styles.selectTrigger} aria-label="Sort by date">
              <span className={styles.triggerText}>
                <ArrowDownWideNarrow size={14} />
                <Select.Value />
              </span>
              <ChevronDown size={14} className={styles.chevronIcon} />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className={styles.selectContent} position="popper">
                <Select.Viewport>
                  <Select.Item className={styles.selectItem} value="date_desc">
                    <Select.ItemIndicator className={styles.itemIndicator}>
                      <Check size={14} />
                    </Select.ItemIndicator>
                    <Select.ItemText>Newest first</Select.ItemText>
                  </Select.Item>
                  <Select.Item className={styles.selectItem} value="date_asc">
                    <Select.ItemIndicator className={styles.itemIndicator}>
                      <Check size={14} />
                    </Select.ItemIndicator>
                    <Select.ItemText>Oldest first</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </label>

        <Popover.Root>
          <Popover.Trigger asChild>
            <button type="button" className={styles.rangeTrigger}>
              <span className={styles.triggerText}>
                <CalendarRange size={14} />
                {hasDateRange
                  ? `${formatHistoryDate(dateRange?.from) || "..."} - ${
                      formatHistoryDate(dateRange?.to) || "..."
                    }`
                  : "Date range"}
              </span>
              <ChevronDown size={14} className={styles.chevronIcon} />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className={styles.rangePopover} sideOffset={8} align="end">
              <div className={styles.rangePickers}>
                <div className={styles.pickerGroup}>
                  <span className={styles.pickerLabel}>From</span>
                  <DayPicker
                    mode="single"
                    selected={dateRange?.from}
                    onSelect={handleFromSelect}
                    captionLayout="dropdown"
                    fromYear={1970}
                    toYear={currentYear + 1}
                    className={styles.dayPicker}
                  />
                </div>
                <div className={styles.pickerGroup}>
                  <span className={styles.pickerLabel}>To</span>
                  <DayPicker
                    mode="single"
                    selected={dateRange?.to}
                    onSelect={handleToSelect}
                    captionLayout="dropdown"
                    fromYear={1970}
                    toYear={currentYear + 1}
                    className={styles.dayPicker}
                  />
                </div>
              </div>
              <div className={styles.rangeActions}>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => onDateRangeChange(undefined)}
                  disabled={!hasDateRange}
                >
                  Reset dates
                </Button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {hasActiveFilters ? (
          <Button variant="ghost" size="md" leftIcon={<X size={14} />} onClick={onClear}>
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
