"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowRight, ChartColumnIncreasing, CircleCheck, CircleAlert, FileChartColumnIncreasing, UsersRound } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { CashFlowReportItem, DriverSummaryReportItem, OverduePaymentReportItem, VehiclePerformanceReportItem, ExpenseAnalysisReport } from "@/types";
import { useFetchCashFlow, useFetchDriverSummary, useFetchOverduePayments } from "@/hooks/useData";
import ReportsSkeleton from "./ReportsSkeleton";
import AdvancedReports from "./AdvancedReports";
import styles from "./reports.module.css";

interface ClientPageProps {
  initialCashFlow: CashFlowReportItem[];
  initialOverduePayments: OverduePaymentReportItem[];
  initialDriverSummary: DriverSummaryReportItem[];
  initialVehiclePerformance: VehiclePerformanceReportItem[];
  initialExpenseAnalysis: ExpenseAnalysisReport;
  initialPlan: string;
}

const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const formatDate = (value: Date | string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(value));
const formatMonth = (value: string) => new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}-02T12:00:00Z`));

type SectionHeadingProps = { icon: ReactNode; title: string; description: string; count?: string };
function SectionHeading({ icon, title, description, count }: SectionHeadingProps) {
  return <div className={styles.sectionHeading}>
    <div className={styles.sectionTitle}><span className={styles.headingIcon} aria-hidden="true">{icon}</span><div><h2>{title}</h2><p>{description}</p></div></div>
    {count && <span className={styles.count}>{count}</span>}
  </div>;
}

function EmptyReport({ icon, title, description, href, linkText }: { icon: ReactNode; title: string; description: string; href?: string; linkText?: string }) {
  return <div className={styles.empty}><span className={styles.emptyVisual} aria-hidden="true">{icon}</span><div className={styles.emptyCopy}><strong>{title}</strong><p>{description}</p>{href && linkText && <Link className={styles.textAction} href={href}>{linkText}<ArrowRight size={15} /></Link>}</div></div>;
}

export default function ReportsClientPage({ initialCashFlow, initialOverduePayments, initialDriverSummary, initialVehiclePerformance, initialExpenseAnalysis, initialPlan }: ClientPageProps) {
  const { data: monthlyCashFlow, isError: isCashFlowError, mutate: mutateCashFlow } = useFetchCashFlow(initialCashFlow);
  const { data: overduePayments, isError: isOverdueError, mutate: mutateOverdue } = useFetchOverduePayments(initialOverduePayments);
  const { data: driverSummaries, isError: isSummaryError, mutate: mutateSummary } = useFetchDriverSummary(initialDriverSummary);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
  const { showToast } = useToast();
  const hasError = isCashFlowError || isOverdueError || isSummaryError;
  const isLoading = !monthlyCashFlow || !overduePayments || !driverSummaries;

  async function handleMarkAsPaid(paymentId: string) {
    if (updatingPaymentId) return;
    setUpdatingPaymentId(paymentId);
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Pago", paymentDate: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error("Falha ao confirmar o pagamento.");
      await Promise.all([mutateCashFlow(), mutateOverdue(), mutateSummary()]);
      showToast("Pagamento confirmado.", "success");
    } catch {
      showToast("Não foi possível confirmar o pagamento. Tente novamente.", "error");
    } finally {
      setUpdatingPaymentId(null);
    }
  }

  return <main className={styles.page}>
    <header className={styles.intro}><div><span className={styles.eyebrow}>Análise da operação</span><h1>Relatórios</h1><p>Acompanhe o caixa, identifique atrasos e veja o resultado de cada motorista e veículo.</p></div><ChartColumnIncreasing className={styles.introIcon} size={92} strokeWidth={1.1} aria-hidden="true" /></header>
    {hasError ? <div className={styles.panel}><EmptyReport icon={<CircleAlert size={28} />} title="Não foi possível carregar os relatórios." description="Verifique a conexão e tente novamente." /><button className={styles.retry} onClick={() => { void Promise.all([mutateCashFlow(), mutateOverdue(), mutateSummary()]); }}>Tentar novamente</button></div> : isLoading ? <ReportsSkeleton /> : <>
      <section className={styles.section} aria-label="Fluxo de caixa mensal">
        <SectionHeading icon={<ChartColumnIncreasing size={21} />} title="Fluxo de caixa mensal" description="Receitas, despesas e resultado por mês." count={`${monthlyCashFlow.length} ${monthlyCashFlow.length === 1 ? "mês" : "meses"}`} />
        <div className={styles.panel}>{monthlyCashFlow.length ? <div className={styles.tableScroll}><table className={styles.table}><thead><tr><th scope="col">Mês</th><th scope="col">Receita</th><th scope="col">Despesas</th><th scope="col">Resultado</th></tr></thead><tbody>{monthlyCashFlow.map(({ month, revenue, expense }) => { const profit = revenue - expense; return <tr key={month}><th scope="row">{formatMonth(month)}</th><td className={styles.positive}>{formatCurrency(revenue)}</td><td>{formatCurrency(expense)}</td><td className={profit >= 0 ? styles.positive : styles.negative}>{formatCurrency(profit)}</td></tr>; })}</tbody></table></div> : <EmptyReport icon={<ChartColumnIncreasing size={28} />} title="Ainda não há movimentações para mostrar." description="Receitas e despesas aparecerão aqui quando a operação tiver lançamentos." href="/dashboard/financial" linkText="Ir para Financeiro" />}</div>
      </section>
      <div className={styles.lowerGrid}>
        <section className={styles.section} aria-label="Relatório de inadimplência"><SectionHeading icon={<CircleAlert size={21} />} title="Inadimplência" description="Cobranças vencidas que precisam de atenção." count={`${overduePayments.length} ${overduePayments.length === 1 ? "atraso" : "atrasos"}`} /><div className={styles.panel}>{overduePayments.length ? <div className={styles.rows}>{overduePayments.map((payment) => <div className={styles.paymentRow} key={payment.id}><div className={styles.rowMain}><strong>{payment.driverName}</strong><span>{payment.vehicleInfo}</span><small>Período: {formatDate(payment.weekStart)} a {formatDate(payment.weekEnd)}</small><small className={styles.negative}>Venceu em {formatDate(payment.dueDate)} · {payment.daysOverdue} {payment.daysOverdue === 1 ? "dia" : "dias"} de atraso</small></div><div className={styles.rowEnd}><strong className={styles.amount}>{formatCurrency(payment.value)}</strong><button className={styles.rowButton} onClick={() => void handleMarkAsPaid(payment.id)} disabled={updatingPaymentId !== null}>{updatingPaymentId === payment.id ? "Confirmando..." : "Confirmar recebimento"}<ArrowRight size={14} /></button></div></div>)}</div> : <EmptyReport icon={<CircleCheck size={28} />} title="Nenhum pagamento em atraso." description="As cobranças vencidas aparecerão aqui para acompanhamento." />}</div></section>
        <section className={styles.section} aria-label="Resumo por motorista"><SectionHeading icon={<UsersRound size={21} />} title="Resumo por motorista" description="Valores recebidos por motorista." count={`${driverSummaries.length} ${driverSummaries.length === 1 ? "motorista" : "motoristas"}`} /><div className={styles.panel}>{driverSummaries.length ? <div className={styles.rows}>{driverSummaries.map((summary) => <div className={styles.summaryRow} key={summary.driverId}><div className={styles.rowMain}><strong>{summary.driverName}</strong><span>{summary.vehicleInfo}</span></div><div className={styles.rowEnd}><small>Total recebido</small><strong className={styles.amount}>{formatCurrency(summary.totalPaid)}</strong></div></div>)}</div> : <EmptyReport icon={<UsersRound size={28} />} title="Ainda não há recebimentos por motorista." description="O resumo será exibido após pagamentos vinculados a contratos." href="/dashboard/contracts" linkText="Ver contratos" />}</div></section>
      </div>
      <section className={`${styles.section} ${styles.advancedSection}`} aria-label="Relatórios avançados"><SectionHeading icon={<FileChartColumnIncreasing size={21} />} title="Relatórios avançados" description="Desempenho dos veículos e composição das despesas." /><AdvancedReports initialVehiclePerformance={initialVehiclePerformance} initialExpenseAnalysis={initialExpenseAnalysis} plan={initialPlan} /></section>
    </>}
  </main>;
}
