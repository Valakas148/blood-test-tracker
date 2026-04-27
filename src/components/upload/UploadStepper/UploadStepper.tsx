"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Alert, Spinner } from "@/components/ui";
import BiomarkerEditor from "@/components/upload/BiomarkerEditor";
import DropZone from "@/components/upload/DropZone";
import { useExtractBiomarkersMutation } from "@/hooks/upload";
import type { Biomarker } from "@/types";
import styles from "./UploadStepper.module.scss";

interface UploadStepperProps {
  onSave: (
    biomarkers: Biomarker[],
    date: string,
    notes: string,
    selectedFile: File | null
  ) => Promise<void>;
  isSaving: boolean;
}

export default function UploadStepper({ onSave, isSaving }: UploadStepperProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const extractMutation = useExtractBiomarkersMutation();

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const extractionError =
    extractMutation.isError && extractMutation.error instanceof Error
      ? extractMutation.error.message
      : null;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setStep(2);
    extractMutation.reset();

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    extractMutation.mutate(
      {
        file,
        signal: controller.signal,
      },
      {
        onSuccess: (items) => {
          setBiomarkers(items);
          setStep(3);
          toast.success(`Extracted ${items.length} biomarkers.`);
        },
        onError: (mutationError) => {
          if (mutationError instanceof Error && mutationError.name === "AbortError") {
            return;
          }
          setStep(1);
          toast.error(
            mutationError instanceof Error
              ? mutationError.message
              : "Extraction failed. Please try again."
          );
        },
      }
    );
  };

  if (step === 1) {
    return (
      <>
        {extractionError ? <Alert tone="error" className={styles.errorBox}>{extractionError}</Alert> : null}
        <DropZone onFileSelect={handleFileSelect} />
      </>
    );
  }

  if (step === 2) {
    return (
      <section className={styles.loadingCard}>
        <Spinner />
        <p>Extracting biomarkers...</p>
        {selectedFile && <small>{selectedFile.name}</small>}
      </section>
    );
  }

  return (
    <BiomarkerEditor
      biomarkers={biomarkers}
      onChange={setBiomarkers}
      onSave={(items, date, notes) => onSave(items, date, notes, selectedFile)}
      onCancel={() => {
        abortControllerRef.current?.abort();
        extractMutation.reset();
        setSelectedFile(null);
        setBiomarkers([]);
        setStep(1);
      }}
      isSaving={isSaving}
    />
  );
}
