import Header from "@/components/layout/Header";
import styles from "@/styles/page-shell.module.scss";
import UploadFlowClient from "./UploadFlowClient";

export default function UploadPage() {
  return (
    <section className={styles.page}>
      <Header title="Upload Test" subtitle="Add new blood test results" />
      <div className={styles.section}>
        <UploadFlowClient />
      </div>
    </section>
  );
}