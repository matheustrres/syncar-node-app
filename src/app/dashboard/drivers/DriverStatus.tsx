import styles from "./drivers.module.css";

export default function DriverStatus({ status }: { status: string }) {
  return (
    <span className={`${styles.status} ${status === "Ativo" ? styles.active : styles.inactive}`}>
      {status}
    </span>
  );
}
