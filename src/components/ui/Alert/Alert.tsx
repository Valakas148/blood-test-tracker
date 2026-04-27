import type { ReactNode } from "react";
import styles from "./Alert.module.scss";

type AlertTone = "success" | "error" | "info";

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Alert({ tone = "info", title, children, className }: AlertProps) {
  return (
    <section className={cx(styles.alert, styles[tone], className)}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      <div className={styles.content}>{children}</div>
    </section>
  );
}
