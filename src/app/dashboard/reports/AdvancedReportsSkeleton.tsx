import styles from "./reports.module.css";

export default function AdvancedReportsSkeleton() {
  return <div className={`${styles.skeleton} ${styles.advancedGrid}`} aria-label="Carregando relatórios avançados" role="status"><div className={`${styles.panel} ${styles.skeletonPanel}`}><div className={styles.skeletonLine} /><div className={styles.skeletonLine} /><div className={styles.skeletonLine} /></div><div className={`${styles.panel} ${styles.skeletonPanel}`}><div className={styles.skeletonLine} /><div className={styles.skeletonLine} /></div></div>;
}
