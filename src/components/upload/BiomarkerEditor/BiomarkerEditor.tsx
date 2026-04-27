"use client";

import * as Popover from "@radix-ui/react-popover";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import BiomarkerTable from "@/components/biomarkers/BiomarkerTable";
import { Button } from "@/components/ui";
import type { Biomarker } from "@/types";
import styles from "./BiomarkerEditor.module.scss";
import "react-day-picker/dist/style.css";

export interface BiomarkerEditorProps {
  biomarkers: Biomarker[];
  onChange: (biomarkers: Biomarker[]) => void;
  onSave: (biomarkers: Biomarker[], date: string, notes: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function BiomarkerEditor({
  biomarkers,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: BiomarkerEditorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  const handleAddRow = () => {
    const newRow: Biomarker = {
      id: crypto.randomUUID(),
      name: "",
      value: 0,
      unit: "",
      referenceRange: { min: 0, max: 0 },
      status: "normal",
    };
    onChange([...biomarkers, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    onChange(biomarkers.filter((biomarker) => biomarker.id !== id));
  };

  const handleSave = () => {
    if (!selectedDate) {
      setDateError("Test date is required.");
      return;
    }

    setDateError(null);
    onSave(biomarkers, formatDateValue(selectedDate), notes);
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2>Edit extracted biomarkers</h2>
        <Button type="button" variant="secondary" size="sm" onClick={handleAddRow}>
          Add row
        </Button>
      </div>

      <BiomarkerTable
        biomarkers={biomarkers}
        onChange={onChange}
        showActions
        onDeleteRow={handleDeleteRow}
      />
      <small className={styles.scrollHint}>Swipe horizontally to view all biomarker columns.</small>

      <div className={styles.formSection}>
        <label className={styles.field}>
          <span>
            Test date <span className={styles.requiredMark}>*</span>
          </span>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button type="button" className={styles.dateTrigger} aria-label="Select test date">
                <span className={styles.dateTriggerLabel}>
                  <CalendarDays size={16} />
                  {selectedDate ? formatDateLabel(selectedDate) : "Pick a date"}
                </span>
                <ChevronDown size={16} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className={styles.datePopover} sideOffset={8} align="start">
                <DayPicker
                  mode="single"
                  captionLayout="dropdown"
                  selected={selectedDate}
                  onSelect={(nextDate) => {
                    setSelectedDate(nextDate);
                    if (nextDate) setDateError(null);
                  }}
                  className={styles.dayPicker}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          {dateError ? <small className={styles.errorText}>{dateError}</small> : null}
        </label>
        <label className={styles.field}>
          <span>Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Any additional observations"
            rows={4}
          />
        </label>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          isLoading={isSaving}
          disabled={isSaving || !selectedDate}
        >
          Save
        </Button>
      </div>
    </section>
  );
}
