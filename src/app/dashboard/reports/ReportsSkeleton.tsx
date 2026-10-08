import styles from "./reports.module.css";

export default function ReportsSkeleton() {
  return <div className={styles.skeleton} aria-label="Carregando relatórios" role="status"><div className={`${styles.panel} ${styles.skeletonPanel}`}><div className={styles.skeletonLine} /><div className={styles.skeletonLine} /><div className={styles.skeletonLine} /></div><div className={styles.lowerGrid}><div className={`${styles.panel} ${styles.skeletonPanel}`}><div className={styles.skeletonLine} /><div className={styles.skeletonLine} /></div><div className={`${styles.panel} ${styles.skeletonPanel}`}><div className={styles.skeletonLine} /><div className={styles.skeletonLine} /></div></div></div>;
}
