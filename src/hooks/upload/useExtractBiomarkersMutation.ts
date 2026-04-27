"use client";

import { useMutation } from "@tanstack/react-query";
import type { Biomarker } from "@/types";

interface ExtractResponse {
  biomarkers?: Biomarker[];
  error?: string;
}

async function postExtractRequest(file: File, signal?: AbortSignal): Promise<Biomarker[]> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/extract", {
    method: "POST",
    body: formData,
    signal,
  });

  const data = (await response.json()) as ExtractResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Extraction failed. Please try again.");
  }

  if (!Array.isArray(data.biomarkers) || data.biomarkers.length === 0) {
    throw new Error("No biomarkers found in the file. Try another file.");
  }

  return data.biomarkers;
}

export function useExtractBiomarkersMutation() {
  return useMutation({
    mutationFn: ({ file, signal }: { file: File; signal?: AbortSignal }) =>
      postExtractRequest(file, signal),
  });
}
