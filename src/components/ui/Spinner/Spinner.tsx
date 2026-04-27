import styles from "./Spinner.module.scss";

type SpinnerSize = "sm" | "md" | "lg";
type SpinnerTone = "primary" | "inherit";

interface SpinnerProps {
  size?: SpinnerSize;
  tone?: SpinnerTone;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Spinner({ size = "md", tone = "primary" }: SpinnerProps) {
  return <span className={cx(styles.spinner, styles[size], tone === "inherit" && styles.inherit)} />;
}
