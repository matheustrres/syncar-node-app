"use client";

import { useState } from "react";
import { ArrowRight, ChartNoAxesCombined, ChartPie, Droplets, FileText, Fuel, LockKeyhole, ReceiptText, Route, ShieldCheck, Sparkles, TriangleAlert, Wrench, type LucideIcon } from "lucide-react";
import { ResponsiveBar } from "@nivo/bar";
import { useFetchVehiclePerformanceReport, useFetchExpenseAnalysisReport } from "@/hooks/useData";
import UpgradeModal from "@/components/ui/UpgradeModal";
import { VehiclePerformanceReportItem, ExpenseAnalysisReport } from "@/types";
import AdvancedReportsSkeleton from "./AdvancedReportsSkeleton";
import ReportCollection from "./ReportCollection";
import styles from "./reports.module.css";

const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

interface AdvancedReportsProps {
  initialVehiclePerformance: VehiclePerformanceReportItem[];
  initialExpenseAnalysis: ExpenseAnalysisReport;
  plan: string;
  view: "vehicles" | "expenses";
}

const chartTheme = {
  axis: { ticks: { text: { fill: "#52655f", fontSize: 11 } } },
  legends: { text: { fill: "#52655f" } },
  tooltip: { container: { background: "#102d30", color: "#fff", borderRadius: "8px", fontSize: "12px" } },
};

const categoryLabels: Record<string, string> = { COMBUSTIVEL: "Combustível", DOCUMENTACAO: "Documentação", LIMPEZA: "Limpeza", MANUTENCAO: "Manutenção", PECAS: "Peças", PEDAGIO: "Pedágio", SEGURO: "Seguro", MULTA: "Multa", TROCA_OLEO: "Troca de óleo", OUTROS: "Outros" };
const categoryIcons: Record<string, LucideIcon> = { COMBUSTIVEL: Fuel, DOCUMENTACAO: FileText, LIMPEZA: Sparkles, MANUTENCAO: Wrench, PECAS: Wrench, PEDAGIO: Route, SEGURO: ShieldCheck, MULTA: TriangleAlert, TROCA_OLEO: Droplets };
const categoryLabel = (name: string) => categoryLabels[name] ?? name.toLocaleLowerCase("pt-BR").replaceAll("_", " ").replace(/^./, first => first.toLocaleUpperCase("pt-BR"));
const monthLabel = (value: string) => new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}-02T12:00:00Z`));

export default function AdvancedReports({ initialVehiclePerformance, initialExpenseAnalysis, plan, view }: AdvancedReportsProps) {
  const hasAccess = plan === "PROFESSIONAL";
  const { data: vehiclePerformance, isLoading: vehicleLoading, isError: vehicleError } = useFetchVehiclePerformanceReport(hasAccess ? initialVehiclePerformance : undefined, hasAccess);
  const { data: expenseAnalysis, isLoading: expenseLoading, isError: expenseError } = useFetchExpenseAnalysisReport(hasAccess ? initialExpenseAnalysis : undefined, hasAccess);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  if (!hasAccess) return <>
    <div className={`${styles.panel} ${styles.gate}`}><div className={styles.gateCopy}><span className={styles.gateIcon} aria-hidden="true"><LockKeyhole size={26} /></span><div><h3>Uma visão mais detalhada da sua operação</h3><p>O plano Profissional libera desempenho por veículo, análise de despesas e exportação de dados.</p></div></div><button onClick={() => setIsUpgradeModalOpen(true)}>Conhecer o Profissional <ArrowRight size={17} /></button></div>
    <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} resourceName="relatórios avançados" monthlyPrice="R$ 49,90" annualPrice="R$ 499" annualSavings="Economize R$ 99,80" />
  </>;

  if (view === "vehicles" ? vehicleLoading : expenseLoading) return <AdvancedReportsSkeleton />;
  if (view === "vehicles" ? vehicleError : expenseError) return <div className={styles.panel}><div className={styles.empty}><span className={styles.emptyVisual}><ChartNoAxesCombined size={28} /></span><div className={styles.emptyCopy}><strong>Não foi possível carregar os relatórios avançados.</strong><p>Atualize a página para tentar novamente.</p></div></div></div>;

  const categoryData = (expenseAnalysis?.byType ?? []).filter(item => item.value > 0).map(item => ({ id: item.name, label: categoryLabel(item.name), icon: categoryIcons[item.name] ?? ReceiptText, value: item.value })).sort((a, b) => b.value - a.value);
  const barData = (expenseAnalysis?.byMonth ?? []).map(item => ({ month: monthLabel(item.month), Despesa: item.value }));
  const hasMonthlyExpenses = barData.some(item => item.Despesa > 0);

  return <div className={styles.advancedGrid}>
    {view === "vehicles" && <div className={styles.panel}><div className={styles.advancedPanelHeader}><h3>Desempenho por veículo</h3><p>Compare receita, despesas e resultado de cada veículo.</p></div>{vehiclePerformance?.length ? <ReportCollection items={vehiclePerformance} label="veículos" searchText={item => item.vehicleInfo} sorts={[{ label: "Maior resultado", compare: (a, b) => b.profit - a.profit }, { label: "Menor resultado", compare: (a, b) => a.profit - b.profit }, { label: "Maior receita", compare: (a, b) => b.totalRevenue - a.totalRevenue }, { label: "Veículo", compare: (a, b) => a.vehicleInfo.localeCompare(b.vehicleInfo, "pt-BR") }]}>{items => <div className={styles.tableScroll}><table className={styles.table}><thead><tr><th scope="col">Veículo</th><th scope="col">Receita</th><th scope="col">Despesas</th><th scope="col">Resultado</th></tr></thead><tbody>{items.map(item => <tr key={item.vehicleId}><th scope="row">{item.vehicleInfo.replace(/\s*\([^()]+\)$/, "")}<small className={styles.vehiclePlate}>{item.vehicleInfo.match(/\(([^()]+)\)$/)?.[1]}</small></th><td className={styles.positive}>{formatCurrency(item.totalRevenue)}</td><td>{formatCurrency(item.totalExpenses)}</td><td className={item.profit >= 0 ? styles.positive : styles.negative}>{formatCurrency(item.profit)}</td></tr>)}</tbody></table></div>}</ReportCollection> : <div className={styles.empty}><span className={styles.emptyVisual} aria-hidden="true"><ChartNoAxesCombined size={28} /></span><div className={styles.emptyCopy}><strong>Ainda não há desempenho por veículo.</strong><p>Os resultados aparecerão após registrar receitas ou despesas vinculadas aos veículos.</p></div></div>}</div>}
    {view === "expenses" && <div className={styles.panel}><div className={styles.advancedPanelHeader}><div className={styles.advancedPanelTitle}><span className={styles.headingIcon} aria-hidden="true"><ChartPie size={21} /></span><div><h3>Análise de despesas</h3><p>Entenda a composição dos custos e sua evolução mensal.</p></div></div></div><div className={styles.chartGrid}><div className={styles.chartCard}><h4>Por categoria</h4>{categoryData.length ? <ul className={styles.categoryBars}>{categoryData.map(item => <li key={item.id}><div><span className={styles.categoryName}><item.icon size={16} aria-hidden="true" />{item.label}</span><strong>{formatCurrency(item.value)}</strong></div><div className={styles.barTrack} aria-hidden="true"><span style={{ width: `${item.value / categoryData[0].value * 100}%` }} /></div></li>)}</ul> : <div className={styles.chartEmpty}><ReceiptText size={22} /><span>Sem despesas por categoria neste período.</span></div>}</div><div className={styles.chartCard}><h4>Ao longo dos meses</h4>{hasMonthlyExpenses ? <div className={styles.chartCanvas} role="img" aria-label={`Despesas por mês: ${barData.map(item => `${item.month}: ${formatCurrency(item.Despesa)}`).join("; ")}`}><ResponsiveBar data={barData} keys={["Despesa"]} indexBy="month" margin={{ top: 20, right: 12, bottom: 46, left: 70 }} padding={0.38} valueScale={{ type: "linear" }} indexScale={{ type: "band", round: true }} colors="#6ca987" borderRadius={3} axisTop={null} axisRight={null} axisBottom={{ tickSize: 0, tickPadding: 12, tickRotation: 0 }} axisLeft={{ tickSize: 0, tickPadding: 8, tickRotation: 0, format: value => new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(value as number) }} enableLabel={false} enableGridY theme={chartTheme} valueFormat={value => formatCurrency(value as number)} /></div> : <div className={styles.chartEmpty}><ChartNoAxesCombined size={22} /><span>Sem despesas mensais para analisar.</span></div>}</div></div></div>}
  </div>;
}
