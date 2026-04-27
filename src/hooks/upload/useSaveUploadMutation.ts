"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BLOOD_TESTS_KEY } from "@/hooks/useBloodTests";
import { db } from "@/lib/db";
import type { BloodTest } from "@/types";

export function useSaveUploadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bloodTest: BloodTest) => db.saveUpload(bloodTest),
    onSuccess: async (_, bloodTest) => {
      queryClient.setQueryData<BloodTest[]>(BLOOD_TESTS_KEY, (current) => {
        const list = current ?? [];
        const withoutExisting = list.filter((item) => item.id !== bloodTest.id);
        return [bloodTest, ...withoutExisting];
      });
      queryClient.setQueryData([...BLOOD_TESTS_KEY, bloodTest.id], bloodTest);
      await queryClient.invalidateQueries({ queryKey: BLOOD_TESTS_KEY, exact: true });
    },
  });
}
