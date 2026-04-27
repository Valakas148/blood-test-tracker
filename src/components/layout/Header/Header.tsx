"use client";

import { useEffect, useState } from "react";
import styles from "./Header.module.scss";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [dateInfo, setDateInfo] = useState({ formatted: "", iso: "" });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const now = new Date();
      setDateInfo({
        formatted: new Intl.DateTimeFormat("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(now),
        iso: now.toISOString(),
      });
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      <time className={styles.date} dateTime={dateInfo.iso}>
        {dateInfo.formatted}
      </time>
    </header>
  );
}