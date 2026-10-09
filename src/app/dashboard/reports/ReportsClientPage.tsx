"use client";

import Link from "next/link";
import { useSWRConfig } from "swr";
import { useState, type ReactNode } from "react";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, CarFront, ChartColumnIncreasing, CircleCheck, CircleAlert, Clock3, LayoutDashboard, ReceiptText, TrendingDown, TrendingUp, UsersRound } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { CashFlowReportItem, DriverSummaryReportItem, OverduePaymentReportItem, VehiclePerformanceReportItem, ExpenseAnalysisReport } from "@/types";
import { useFetchCashFlow, useFetchDriverSummary, useFetchOverduePayments } from "@/hooks/useData";
import ReportsSkeleton from "./ReportsSkeleton";
import AdvancedReports from "./AdvancedReports";
import ReportCollection from "./ReportCollection";
import OverduePaymentsList from "./OverduePaymentsList";
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
  const [tab, setTab] = useState("overview");
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
  const { showToast } = useToast();
  const { mutate } = useSWRConfig();
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
      await Promise.all([mutateCashFlow(), mutateOverdue(), mutateSummary(), ...(initialPlan === "PROFESSIONAL" ? [mutate("/api/reports/vehicle-performance")] : [])]);
      showToast("Pagamento confirmado.", "success");
    } catch {
      showToast("Não foi possível confirmar o pagamento. Tente novamente.", "error");
    } finally {
      setUpdatingPaymentId(null);
    }
  }

  const revenue = monthlyCashFlow?.reduce((sum, item) => sum + item.revenue, 0) ?? 0;
  const expenses = monthlyCashFlow?.reduce((sum, item) => sum + item.expense, 0) ?? 0;
  const overdueTotal = overduePayments?.reduce((sum, item) => sum + Number(item.value), 0) ?? 0;
  const months = monthlyCashFlow?.map(item => item.month).sort() ?? [];
  const period = months.length ? `${formatMonth(months[0])} a ${formatMonth(months[months.length - 1])}` : "Sem movimentações";
  const tabs = [{ id: "overview", label: "Visão geral", icon: LayoutDashboard }, { id: "overdue", label: "Inadimplência", icon: CircleAlert }, { id: "drivers", label: "Motoristas", icon: UsersRound }, { id: "vehicles", label: "Veículos", icon: CarFront }];
  const result = revenue - expenses;

  return <main className={styles.page}>
    <header className={styles.intro}><div><span className={styles.eyebrow}>Análise da operação</span><h1>Relatórios</h1><p>Acompanhe o caixa, identifique atrasos e veja o resultado de cada motorista e veículo.</p></div><ChartColumnIncreasing className={styles.introIcon} size={60} strokeWidth={1.1} aria-hidden="true" /></header>
    {hasError ? <div className={styles.panel}><EmptyReport icon={<CircleAlert size={28} />} title="Não foi possível carregar os relatórios." description="Verifique a conexão e tente novamente." /><button className={styles.retry} onClick={() => { void Promise.all([mutateCashFlow(), mutateOverdue(), mutateSummary()]); }}>Tentar novamente</button></div> : isLoading ? <ReportsSkeleton /> : <>
      <div className={styles.reportPeriod}>Período das movimentações: <strong>{period}</strong></div>
      <dl className={styles.metrics}>
        <div><dt><span className={`${styles.metricIcon} ${styles.metricIconPositive}`} aria-hidden="true"><ArrowDownLeft size={17} /></span>Receita recebida</dt><dd>{formatCurrency(revenue)}</dd></div>
        <div><dt><span className={styles.metricIcon} aria-hidden="true"><ReceiptText size={17} /></span>Despesas</dt><dd>{formatCurrency(expenses)}</dd></div>
        <div><dt><span className={`${styles.metricIcon} ${result >= 0 ? styles.metricIconPositive : styles.metricIconNegative}`} aria-hidden="true">{result >= 0 ? <TrendingUp size={17} /> : <TrendingDown size={17} />}</span>Resultado</dt><dd className={result >= 0 ? styles.positive : styles.negative}>{formatCurrency(result)}</dd></div>
        <div><dt><span className={`${styles.metricIcon} ${styles.metricIconNegative}`} aria-hidden="true"><Clock3 size={17} /></span>Total em atraso · todos os vencimentos</dt><dd className={styles.negative}>{formatCurrency(overdueTotal)}</dd></div>
      </dl>
      <div className={styles.tabs} role="tablist" aria-label="Relatórios" onKeyDown={event => {
        const index = tabs.findIndex(item => item.id === tab);
        const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
        if (next >= 0) { event.preventDefault(); setTab(tabs[next].id); document.getElementById(`tab-${tabs[next].id}`)?.focus(); }
      }}>{tabs.map(item => <button key={item.id} role="tab" id={`tab-${item.id}`} aria-selected={tab === item.id} aria-controls={`panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} onClick={() => setTab(item.id)}><item.icon size={17} aria-hidden="true" />{item.label}{item.id === "overdue" && overduePayments.length > 0 && <span>{overduePayments.length}</span>}</button>)}</div>
      <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" hidden={tab !== "overview"} tabIndex={0}>
      <section className={styles.section} aria-label="Fluxo de caixa mensal">
        <SectionHeading icon={<ChartColumnIncreasing size={21} />} title="Fluxo de caixa mensal" description="Receitas, despesas e resultado por mês." count={`${monthlyCashFlow.length} ${monthlyCashFlow.length === 1 ? "mês" : "meses"}`} />
        <div className={styles.panel}>{monthlyCashFlow.length ? <div className={styles.tableScroll}><table className={styles.table}><thead><tr><th scope="col">Mês</th><th scope="col">Receita</th><th scope="col">Despesas</th><th scope="col">Resultado</th></tr></thead><tbody>{monthlyCashFlow.map(({ month, revenue, expense }) => { const profit = revenue - expense; return <tr key={month}><th scope="row">{formatMonth(month)}</th><td className={styles.positive}>{formatCurrency(revenue)}</td><td>{formatCurrency(expense)}</td><td className={profit >= 0 ? styles.positive : styles.negative}><span className={styles.resultValue}>{profit >= 0 ? <ArrowUpRight size={15} aria-hidden="true" /> : <TrendingDown size={15} aria-hidden="true" />}{formatCurrency(profit)}</span></td></tr>; })}</tbody></table></div> : <EmptyReport icon={<ChartColumnIncreasing size={28} />} title="Ainda não há movimentações para mostrar." description="Receitas e despesas aparecerão aqui quando a operação tiver lançamentos." href="/dashboard/financial" linkText="Ir para Financeiro" />}</div>
      </section>
      <AdvancedReports view="expenses" initialVehiclePerformance={initialVehiclePerformance} initialExpenseAnalysis={initialExpenseAnalysis} plan={initialPlan} />
      </div>
      <div role="tabpanel" id="panel-overdue" aria-labelledby="tab-overdue" hidden={tab !== "overdue"} tabIndex={0}>
        <section className={styles.section} aria-label="Relatório de inadimplência"><SectionHeading icon={<CircleAlert size={21} />} title="Inadimplência" description="Cobranças vencidas que precisam de atenção." count={`${overduePayments.length} ${overduePayments.length === 1 ? "atraso" : "atrasos"}`} /><div className={styles.panel}>{overduePayments.length ? <OverduePaymentsList payments={overduePayments} updatingPaymentId={updatingPaymentId} onMarkAsPaid={handleMarkAsPaid} /> : <EmptyReport icon={<CircleCheck size={28} />} title="Nenhum pagamento em atraso." description="As cobranças vencidas aparecerão aqui para acompanhamento." />}</div></section>
      </div>
      <div role="tabpanel" id="panel-drivers" aria-labelledby="tab-drivers" hidden={tab !== "drivers"} tabIndex={0}>
        <section className={styles.section} aria-label="Resumo por motorista"><SectionHeading icon={<UsersRound size={21} />} title="Resumo por motorista" description="Valores recebidos por motorista." count={`${driverSummaries.length} ${driverSummaries.length === 1 ? "motorista" : "motoristas"}`} /><div className={styles.panel}>{driverSummaries.length ? <ReportCollection items={driverSummaries} label="motoristas" searchText={item => `${item.driverName} ${item.vehicleInfo}`} sorts={[{ label: "Maior valor recebido", compare: (a, b) => b.totalPaid - a.totalPaid }, { label: "Menor valor recebido", compare: (a, b) => a.totalPaid - b.totalPaid }, { label: "Nome", compare: (a, b) => a.driverName.localeCompare(b.driverName, "pt-BR") }]}>{items => <div className={styles.rows}>{items.map(summary => <div className={styles.summaryRow} key={summary.driverId}><div className={styles.rowMain}><strong>{summary.driverName}</strong><span>{summary.vehicleInfo || "Sem veículo vinculado"}</span></div><div className={styles.rowEnd}><small>Total recebido</small><strong className={styles.amount}>{formatCurrency(summary.totalPaid)}</strong></div></div>)}</div>}</ReportCollection> : <EmptyReport icon={<UsersRound size={28} />} title="Ainda não há recebimentos por motorista." description="O resumo será exibido após pagamentos vinculados a contratos." href="/dashboard/contracts" linkText="Ver contratos" />}</div></section>
      </div>
      <div role="tabpanel" id="panel-vehicles" aria-labelledby="tab-vehicles" hidden={tab !== "vehicles"} tabIndex={0}><AdvancedReports view="vehicles" initialVehiclePerformance={initialVehiclePerformance} initialExpenseAnalysis={initialExpenseAnalysis} plan={initialPlan} /></div>
    </>}
  </main>;
}
