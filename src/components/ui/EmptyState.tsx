import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  actionButton?: ReactNode;
  role?: "alert" | "status";
}

export default function EmptyState({
  Icon,
  title,
  description,
  actionButton,
  role,
}: EmptyStateProps) {
  return (
    <section className={styles.panel} role={role}>
      <span className={styles.visual}><Icon size={26} strokeWidth={1.8} aria-hidden="true" /></span>
      <div className={styles.copy}>
        <h2>{title}</h2>
        <p>{description}</p>
        {actionButton && <div className={styles.action}>{actionButton}</div>}
      </div>
    </section>
  );
}
