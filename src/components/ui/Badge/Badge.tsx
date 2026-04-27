import type { ReactNode } from "react";
import styles from "./Badge.module.scss";

type BadgeTone =
  | "default"
  | "pdf"
  | "image"
  | "csv"
  | "manual"
  | "normal"
  | "low"
  | "high";

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Badge({ children, tone = "default", className }: BadgeProps) {
  return <span className={cx(styles.badge, styles[tone], className)}>{children}</span>;
}
