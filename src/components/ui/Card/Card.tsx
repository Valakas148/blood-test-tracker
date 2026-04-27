import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.scss";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Card({ children, className, ...rest }: CardProps) {
  return (
    <section className={cx(styles.card, className)} {...rest}>
      {children}
    </section>
  );
}
