"use client";

import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import BiomarkerTable from "@/components/biomarkers/BiomarkerTable";
import Header from "@/components/layout/Header";
import { Badge, Button, ConfirmDialog, EmptyState, Spinner } from "@/components/ui";
import { useBloodTest, useDeleteBloodTest, useUpdateBloodTest } from "@/hooks/useBloodTests";
import type { Biomarker, BloodTest } from "@/types";
import shellStyles from "@/styles/page-shell.module.scss";
import styles from "./page.module.scss";

function isAbnormal(status: Biomarker["status"]) {
  return status !== "normal";
}

function sortBiomarkersForView(biomarkers: Biomarker[], abnormalFirst: boolean) {
  const list = [...biomarkers];
  if (!abnormalFirst) return list;
  return list.sort((a, b) => {
    const aWeight = isAbnormal(a.status) ? 0 : 1;
    const bWeight = isAbnormal(b.status) ? 0 : 1;
    return aWeight - bWeight;
  });
}

function areBiomarkersEqual(left: Biomarker[], right: Biomarker[]) {
  if (left.length !== right.length) return false;
  return left.every((biomarker, index) => {
    const other = right[index];
    if (!other) return false;
    return (
      biomarker.id === other.id &&
      biomarker.name === other.name &&
      biomarker.value === other.value &&
      biomarker.unit === other.unit &&
      biomarker.status === other.status &&
      biomarker.referenceRange.min === other.referenceRange.min &&
      biomarker.referenceRange.max === other.referenceRange.max
    );
  });
}

function HistoryDetailContent({ test, id }: { test: BloodTest; id: string }) {
  const router = useRouter();
  const deleteMutation = useDeleteBloodTest();
  const updateMutation = useUpdateBloodTest();
  const [abnormalFirst, setAbnormalFirst] = useState(true);
  const [initialBiomarkers, setInitialBiomarkers] = useState<Biomarker[]>(test.biomarkers);
  const [editedBiomarkers, setEditedBiomarkers] = useState<Biomarker[]>(test.biomarkers);
  const [displayOrder, setDisplayOrder] = useState<string[]>(
    sortBiomarkersForView(test.biomarkers, true).map((biomarker) => biomarker.id)
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const hasBiomarkerChanges = useMemo(
    () => !areBiomarkersEqual(editedBiomarkers, initialBiomarkers),
    [editedBiomarkers, initialBiomarkers]
  );

  const displayBiomarkers = useMemo(() => {
    const byId = new Map(editedBiomarkers.map((biomarker) => [biomarker.id, biomarker]));
    return displayOrder
      .map((biomarkerId) => byId.get(biomarkerId))
      .filter((biomarker): biomarker is Biomarker => Boolean(biomarker));
  }, [displayOrder, editedBiomarkers]);

  const handleDisplayBiomarkersChange = (nextDisplayBiomarkers: Biomarker[]) => {
    const nextById = new Map(nextDisplayBiomarkers.map((biomarker) => [biomarker.id, biomarker]));
    setEditedBiomarkers((current) =>
      current.map((biomarker) => nextById.get(biomarker.id) ?? biomarker)
    );
  };

  const handleToggleSort = () => {
    setAbnormalFirst((current) => {
      const next = !current;
      setDisplayOrder(
        sortBiomarkersForView(editedBiomarkers, next).map((biomarker) => biomarker.id)
      );
      return next;
    });
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Blood test deleted.");
      setIsDeleteDialogOpen(false);
      router.push("/history");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete blood test.");
    }
  };

  const handleSave = async () => {
    if (!id || !hasBiomarkerChanges) return;
    try {
      await updateMutation.mutateAsync({
        id,
        data: { biomarkers: editedBiomarkers },
      });
      setInitialBiomarkers(editedBiomarkers);
      setDisplayOrder(
        sortBiomarkersForView(editedBiomarkers, abnormalFirst).map((biomarker) => biomarker.id)
      );
      toast.success("Changes saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save changes.");
    }
  };

  const source = test.source;
  const sourceLabel =
    source === "pdf" ? "PDF" : source === "image" ? "Image" : source === "csv" ? "CSV" : "Manual";

  return (
    <>
      <div className={styles.toolbar}>
        <Button variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={() => router.push("/history")}>
          Back
        </Button>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={handleToggleSort}>
            {abnormalFirst ? "Show original order" : "Show abnormal first"}
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
          >
            Delete test
          </Button>
        </div>
      </div>

      <div className={styles.summary}>
        <Badge tone={source}>{sourceLabel}</Badge>
        <span>
          {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(
            new Date(test.date)
          )}
        </span>
        <span>{editedBiomarkers.length} biomarkers</span>
      </div>

      <BiomarkerTable
        biomarkers={displayBiomarkers}
        onChange={handleDisplayBiomarkersChange}
        highlightAbnormalRows={abnormalFirst}
      />

      {test.notes ? (
        <div className={styles.notes}>
          <strong>Notes:</strong> {test.notes}
        </div>
      ) : null}

      <div className={styles.actions}>
        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={updateMutation.isPending}
          disabled={!hasBiomarkerChanges || updateMutation.isPending}
        >
          Save changes
        </Button>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete this test?"
        description="This action cannot be undone. The blood test record will be permanently removed."
        confirmLabel="Delete test"
        cancelLabel="Cancel"
        isConfirming={deleteMutation.isPending}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export default function HistoryDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const bloodTestQuery = useBloodTest(id);

  return (
    <section className={shellStyles.page}>
      <Header title="History Detail" subtitle="Review a single blood test record" />

      <div className={`${shellStyles.section} ${styles.section}`}>
        {bloodTestQuery.isLoading ? (
          <div className={styles.loading}>
            <Spinner />
          </div>
        ) : null}

        {!bloodTestQuery.isLoading && !bloodTestQuery.data ? (
          <EmptyState
            title="Test not found"
            description="This record may have been removed or the id is invalid."
            action={
              <Button variant="secondary" onClick={() => router.push("/history")}>
                Back to History
              </Button>
            }
          />
        ) : null}

        {!bloodTestQuery.isLoading && bloodTestQuery.data ? (
          <HistoryDetailContent key={bloodTestQuery.data.id} test={bloodTestQuery.data} id={id} />
        ) : null}
      </div>
    </section>
  );
}