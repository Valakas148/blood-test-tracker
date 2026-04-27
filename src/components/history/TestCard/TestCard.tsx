import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import type { BloodTest } from "@/types";
import styles from "./TestCard.module.scss";

interface TestCardProps {
  test: BloodTest;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const SOURCE_LABELS: Record<BloodTest["source"], string> = {
  pdf: "PDF",
  image: "Image",
  csv: "CSV",
  manual: "Manual",
};

function sourceToLabel(source: BloodTest["source"]) {
  return SOURCE_LABELS[source];
}

export default function TestCard({ test }: TestCardProps) {
  const abnormalCount = test.biomarkers.filter((biomarker) => biomarker.status !== "normal").length;

  return (
    <Link href={`/history/${test.id}`} className={styles.link}>
      <Card className={styles.card}>
        <div className={styles.top}>
          <p className={styles.date}>{dateFormatter.format(new Date(test.date))}</p>
          <Badge tone={test.source}>{sourceToLabel(test.source)}</Badge>
        </div>

        <p className={styles.meta}>
          {test.biomarkers.length} biomarker{test.biomarkers.length === 1 ? "" : "s"}
        </p>

        <p className={abnormalCount > 0 ? styles.abnormal : styles.abnormalPlaceholder}>
          {abnormalCount > 0 ? (
            <>
              {abnormalCount} abnormal marker{abnormalCount === 1 ? "" : "s"}
            </>
          ) : (
            "No abnormal markers"
          )}
        </p>
      </Card>
    </Link>
  );
}
