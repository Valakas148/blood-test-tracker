"use client";

import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Button, Card } from "@/components/ui";
import styles from "./DropZone.module.scss";

const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpg",
  "image/jpeg",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
]);

const ACCEPTED_EXTENSIONS = new Set(["pdf", "png", "jpg", "jpeg", "csv"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

interface DropZoneProps {
  onFileSelect: (file: File) => void;
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function DropZone({ onFileSelect }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const selectedFileSize = useMemo(
    () => (selectedFile ? formatFileSize(selectedFile.size) : null),
    [selectedFile]
  );

  const validateAndSetFile = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const isMimeTypeAccepted = ACCEPTED_MIME_TYPES.has(file.type);
    const isExtensionAccepted = ACCEPTED_EXTENSIONS.has(extension);

    if (!isMimeTypeAccepted && !isExtensionAccepted) {
      setError("Unsupported file type. Please upload PDF, PNG, JPG, JPEG, or CSV.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File is too large. Maximum allowed size is 10MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    validateAndSetFile(file);
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    validateAndSetFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <Card className={styles.container}>
      <h2 className={styles.title}>Upload blood test file</h2>
      <p className={styles.subtitle}>
        Drag and drop your file here, or click the card to choose one.
      </p>

      <div
        className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <p className={styles.dropText}>Drop file here or click to browse</p>
        <p className={styles.helperText}>Accepted: PDF, PNG, JPG, JPEG, CSV (max 10MB)</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        className={styles.hiddenInput}
        onChange={handleFileInputChange}
        accept=".pdf,.png,.jpg,.jpeg,.csv"
      />

      {error && <p className={styles.error}>{error}</p>}

      {selectedFile && (
        <div className={styles.fileInfo}>
          <div>
            <p className={styles.fileName}>{selectedFile.name}</p>
            <p className={styles.fileSize}>{selectedFileSize}</p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={handleRemoveFile}>
            Remove file
          </Button>
        </div>
      )}
    </Card>
  );
}
