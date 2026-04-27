"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import type { BloodTest } from "@/types";

export const BLOOD_TESTS_KEY = ["bloodTests"] as const;

export function useBloodTests() {
  return useQuery({
    queryKey: BLOOD_TESTS_KEY,
    queryFn: () => db.getUploads(),
    select: (data) => [...data].sort((a, b) => b.createdAt - a.createdAt),
  });
}

export function useBloodTest(id: string) {
  return useQuery({
    queryKey: [...BLOOD_TESTS_KEY, id],
    queryFn: () => db.getUploadById(id),
    enabled: !!id,
  });
}

export function useDeleteBloodTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => db.deleteUpload(id),
    onSuccess: async (_, id) => {
      queryClient.setQueryData<BloodTest[]>(BLOOD_TESTS_KEY, (current) =>
        (current ?? []).filter((test) => test.id !== id)
      );
      queryClient.removeQueries({ queryKey: [...BLOOD_TESTS_KEY, id], exact: true });
      await queryClient.invalidateQueries({ queryKey: BLOOD_TESTS_KEY, exact: true });
    },
  });
}

export function useUpdateBloodTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BloodTest> }) =>
      db.updateUpload(id, data),
    onSuccess: async (_, { id, data }) => {
      queryClient.setQueryData<BloodTest[]>(BLOOD_TESTS_KEY, (current) =>
        (current ?? []).map((test) => (test.id === id ? { ...test, ...data, id } : test))
      );
      queryClient.setQueryData<BloodTest | null>([...BLOOD_TESTS_KEY, id], (current) =>
        current ? { ...current, ...data, id } : current
      );
      await queryClient.invalidateQueries({ queryKey: BLOOD_TESTS_KEY, exact: true });
      await queryClient.invalidateQueries({ queryKey: [...BLOOD_TESTS_KEY, id] });
    },
  });
}
