"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { OverduePaymentReportItem } from "@/types";
import { groupOverduePayments } from "./report-data";
import ReportCollection from "./ReportCollection";
import styles from "./reports.module.css";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const date = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
interface Props {
  payments: OverduePaymentReportItem[];
  updatingPaymentId: string | null;
  onMarkAsPaid: (id: string) => Promise<void>;
}

function DriverPayments({ payments, updatingPaymentId, onMarkAsPaid }: Props) {
  const [limit, setLimit] = useState(5);
  return <><ul className={styles.rows}>{payments.slice(0, limit).map(payment => <li className={styles.paymentRow} key={payment.id}>
    <div className={styles.rowMain}><strong>{payment.vehicleInfo}</strong><small>Período: {date.format(new Date(payment.weekStart))} a {date.format(new Date(payment.weekEnd))}</small><small className={styles.negative}>Venceu em {date.format(new Date(payment.dueDate))} · {payment.daysOverdue} dias de atraso</small></div>
    <div className={styles.rowEnd}><strong className={styles.amount}>{money.format(payment.value)}</strong><button className={styles.rowButton} onClick={() => void onMarkAsPaid(payment.id)} disabled={updatingPaymentId !== null} aria-label={`Confirmar recebimento de ${money.format(payment.value)} de ${payment.driverName}, vencimento ${date.format(new Date(payment.dueDate))}`}>{updatingPaymentId === payment.id ? "Confirmando..." : "Confirmar recebimento"}<ArrowRight size={14} aria-hidden="true" /></button></div>
  </li>)}</ul>{payments.length > 5 && <div className={styles.detailFooter}><span>{Math.min(limit, payments.length)} de {payments.length} cobranças</span>{limit < payments.length ? <button className={styles.textAction} onClick={() => setLimit(limit + 5)}>Mostrar mais 5</button> : <button className={styles.textAction} onClick={() => setLimit(5)}>Mostrar menos</button>}</div>}</>;
}

export default function OverduePaymentsList(props: Props) {
  const drivers = groupOverduePayments(props.payments);
  return <div className={styles.overdueList}><ReportCollection items={drivers} label="motoristas em atraso" searchText={driver => `${driver.name} ${driver.payments.map(payment => payment.vehicleInfo).join(" ")}`} sorts={[{ label: "Maior atraso", compare: (a, b) => b.days - a.days }, { label: "Maior valor pendente", compare: (a, b) => b.total - a.total }, { label: "Nome", compare: (a, b) => a.name.localeCompare(b.name, "pt-BR") }]}>{visible => <div className={styles.rows}>{visible.map(driver => <details key={driver.id} className={styles.driverDetails}><summary><div className={styles.rowMain}><strong>{driver.name}</strong><span>{driver.payments.length} {driver.payments.length === 1 ? "cobrança pendente" : "cobranças pendentes"} · atraso mais antigo: {driver.days} dias</span></div><strong className={styles.amount}>{money.format(driver.total)}</strong><ChevronDown size={18} aria-hidden="true" /></summary><DriverPayments {...props} payments={driver.payments} /></details>)}</div>}</ReportCollection></div>;
}
