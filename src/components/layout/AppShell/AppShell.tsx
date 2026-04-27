"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import styles from "./AppShell.module.scss";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={styles.shell}>
      <div className={styles.sidebar}>
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((current) => !current)} />
      </div>

      <div className={styles.content}>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
