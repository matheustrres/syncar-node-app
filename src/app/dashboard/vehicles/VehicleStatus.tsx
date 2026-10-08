import styles from "./vehicles.module.css";

export default function VehicleStatus({ status }: { status: string }) {
  const tone =
    status === "Disponível"
      ? styles.statusAvailable
      : status === "Manutenção"
        ? styles.statusMaintenance
        : styles.statusRented;

  return <span className={`${styles.status} ${tone}`}>{status}</span>;
}
