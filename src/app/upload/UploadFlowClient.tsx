"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, Button } from "@/components/ui";
import UploadStepper from "@/components/upload/UploadStepper";
import { useSaveUploadMutation } from "@/hooks/upload";
import type { Biomarker, BloodTest } from "@/types";
import styles from "./UploadFlowClient.module.scss";

function getSourceFromFile(file: File | null): BloodTest["source"] {
  if (!file) return "manual";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (extension === "csv") return "csv";
  if (extension === "png" || extension === "jpg" || extension === "jpeg") return "image";
  return "manual";
}

export default function UploadFlowClient() {
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const saveUploadMutation = useSaveUploadMutation();

  const handleSave = async (
    biomarkers: Biomarker[],
    date: string,
    notes: string,
    selectedFile: File | null
  ) => {
    setSaveError(null);
    if (!date.trim()) {
      const message = "Test date is required.";
      setSaveError(message);
      toast.error(message);
      return;
    }

    const bloodTest: BloodTest = {
      id: crypto.randomUUID(),
      date,
      source: getSourceFromFile(selectedFile),
      fileName: selectedFile?.name,
      biomarkers,
      notes: notes.trim() ? notes : undefined,
      createdAt: Date.now(),
    };

    try {
      const id = await saveUploadMutation.mutateAsync(bloodTest);
      setSavedId(id);
      toast.success("Upload saved successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save upload.";
      setSaveError(message);
      toast.error(message);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h2>Upload and verify biomarkers</h2>
        <p>
          Add a report file, review extracted biomarkers, and save your final values into local
          history.
        </p>
      </div>

      {savedId ? (
        <Alert tone="success" title="Upload saved successfully" className={styles.successCard}>
          <p>The test has been stored in local IndexedDB storage.</p>
          <div className={styles.successActions}>
            <Link href={`/history/${savedId}`} className={styles.primaryLink}>
              View in History
            </Link>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSavedId(null);
                setSaveError(null);
              }}
            >
              Upload another file
            </Button>
          </div>
        </Alert>
      ) : (
        <UploadStepper onSave={handleSave} isSaving={saveUploadMutation.isPending} />
      )}

      {saveError ? (
        <Alert tone="error" className={styles.errorCard}>
          {saveError}
        </Alert>
      ) : null}
    </div>
  );
}
