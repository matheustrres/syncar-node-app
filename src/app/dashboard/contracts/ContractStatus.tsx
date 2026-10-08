import styles from "./contracts.module.css";

export default function ContractStatus({ status }: { status: string }) {
  return <span className={`${styles.status} ${status === "Ativo" ? styles.active : styles.finished}`}>{status}</span>;
}
