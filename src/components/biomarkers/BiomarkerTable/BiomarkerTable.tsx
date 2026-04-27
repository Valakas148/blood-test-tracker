"use client";

import { Button } from "@/components/ui";
import { getBiomarkerStatus } from "@/lib/validators/biomarker.validator";
import type { Biomarker } from "@/types";
import styles from "./BiomarkerTable.module.scss";

interface BiomarkerTableProps {
  biomarkers: Biomarker[];
  onChange: (biomarkers: Biomarker[]) => void;
  showActions?: boolean;
  onDeleteRow?: (id: string) => void;
  highlightAbnormalRows?: boolean;
}

function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getStatusClass(status: Biomarker["status"]) {
  if (status === "low") return styles.low;
  if (status === "high") return styles.high;
  return styles.normal;
}

export default function BiomarkerTable({
  biomarkers,
  onChange,
  showActions = false,
  onDeleteRow,
  highlightAbnormalRows = false,
}: BiomarkerTableProps) {
  const updateBiomarker = (
    id: string,
    updater: (biomarker: Biomarker) => Biomarker
  ) => {
    const next = biomarkers.map((biomarker) =>
      biomarker.id === id ? updater(biomarker) : biomarker
    );
    onChange(next);
  };

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.nameCell}>Name</th>
            <th>Value</th>
            <th>Unit</th>
            <th>Range Min</th>
            <th>Range Max</th>
            <th className={styles.statusCell}>Status</th>
            {showActions ? <th className={styles.actionsCell}>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {biomarkers.map((biomarker) => (
            <tr
              key={biomarker.id}
              className={highlightAbnormalRows && biomarker.status !== "normal" ? styles.abnormalRow : undefined}
            >
              <td className={styles.nameCell}>
                <input
                  aria-label={`Biomarker name for row ${biomarker.id}`}
                  value={biomarker.name}
                  onChange={(event) =>
                    updateBiomarker(biomarker.id, (current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  aria-label={`Biomarker value for ${biomarker.name || biomarker.id}`}
                  value={biomarker.value}
                  onChange={(event) =>
                    updateBiomarker(biomarker.id, (current) => {
                      const value = parseNumber(event.target.value);
                      if (value === null) return current;
                      return {
                        ...current,
                        value,
                        status: getBiomarkerStatus(value, current.referenceRange),
                      };
                    })
                  }
                />
              </td>
              <td>
                <input
                  aria-label={`Biomarker unit for ${biomarker.name || biomarker.id}`}
                  value={biomarker.unit}
                  onChange={(event) =>
                    updateBiomarker(biomarker.id, (current) => ({
                      ...current,
                      unit: event.target.value,
                    }))
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  aria-label={`Minimum reference range for ${biomarker.name || biomarker.id}`}
                  value={biomarker.referenceRange.min}
                  onChange={(event) =>
                    updateBiomarker(biomarker.id, (current) => {
                      const min = parseNumber(event.target.value);
                      if (min === null) return current;
                      const nextRange = {
                        ...current.referenceRange,
                        min,
                      };
                      return {
                        ...current,
                        referenceRange: nextRange,
                        status: getBiomarkerStatus(current.value, nextRange),
                      };
                    })
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  aria-label={`Maximum reference range for ${biomarker.name || biomarker.id}`}
                  value={biomarker.referenceRange.max}
                  onChange={(event) =>
                    updateBiomarker(biomarker.id, (current) => {
                      const max = parseNumber(event.target.value);
                      if (max === null) return current;
                      const nextRange = {
                        ...current.referenceRange,
                        max,
                      };
                      return {
                        ...current,
                        referenceRange: nextRange,
                        status: getBiomarkerStatus(current.value, nextRange),
                      };
                    })
                  }
                />
              </td>
              <td className={styles.statusCell}>
                <span className={`${styles.statusBadge} ${getStatusClass(biomarker.status)}`}>
                  {biomarker.status}
                </span>
              </td>
              {showActions ? (
                <td className={styles.actionsCell}>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => onDeleteRow?.(biomarker.id)}
                  >
                    Delete
                  </Button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

