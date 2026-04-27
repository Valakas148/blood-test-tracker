"use client";

import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, X } from "lucide-react";
import styles from "./BiomarkerSelector.module.scss";

interface BiomarkerSelectorProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function BiomarkerSelector({
  options,
  selected,
  onChange,
}: BiomarkerSelectorProps) {
  const selectedSet = new Set(selected);

  const toggleOption = (option: string) => {
    if (selectedSet.has(option)) {
      onChange(selected.filter((name) => name !== option));
      return;
    }
    onChange([...selected, option]);
  };

  const handleSelectAll = () => onChange(options);
  const handleClearAll = () => onChange([]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.label}>Biomarkers</p>
        <p className={styles.count}>{selected.length} selected</p>
      </div>

      <Popover.Root>
        <Popover.Trigger asChild>
          <button type="button" className={styles.trigger}>
            <span>{selected.length > 0 ? "Edit selection" : "Select biomarkers"}</span>
            <ChevronDown size={16} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className={styles.content} sideOffset={8} align="start">
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={handleSelectAll}
                disabled={options.length === 0}
              >
                Select all
              </button>
              <button
                type="button"
                className={styles.actionButton}
                onClick={handleClearAll}
                disabled={selected.length === 0}
              >
                Clear all
              </button>
            </div>

            <div className={styles.list} role="listbox" aria-multiselectable="true">
              {options.map((option) => {
                const isSelected = selectedSet.has(option);

                return (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={styles.option}
                    onClick={() => toggleOption(option)}
                  >
                    <span className={`${styles.checkbox} ${isSelected ? styles.checkboxChecked : ""}`}>
                      {isSelected ? <Check size={12} /> : null}
                    </span>
                    <span className={styles.optionText}>{option}</span>
                  </button>
                );
              })}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {selected.length > 0 ? (
        <div className={styles.pills}>
          {selected.map((name) => (
            <button
              key={name}
              type="button"
              className={styles.pill}
              onClick={() => toggleOption(name)}
              aria-label={`Remove ${name}`}
            >
              <span>{name}</span>
              <X size={12} aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
