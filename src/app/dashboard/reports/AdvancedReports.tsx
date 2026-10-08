"use client";

import { useState } from "react";
import { ArrowRight, ChartNoAxesCombined, LockKeyhole, ReceiptText } from "lucide-react";
import { ResponsivePie, PieCustomLayerProps } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { useFetchProfile, useFetchVehiclePerformanceReport, useFetchExpenseAnalysisReport } from "@/hooks/useData";
import UpgradeModal from "@/components/ui/UpgradeModal";
import { VehiclePerformanceReportItem, ExpenseAnalysisReport } from "@/types";
import AdvancedReportsSkeleton from "./AdvancedReportsSkeleton";
import styles from "./reports.module.css";

const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

interface AdvancedReportsProps {
  initialVehiclePerformance: VehiclePerformanceReportItem[];
  initialExpenseAnalysis: ExpenseAnalysisReport;
}

const chartTheme = {
  axis: { ticks: { text: { fill: "#52655f", fontSize: 11 } } },
  legends: { text: { fill: "#52655f" } },
  tooltip: { container: { background: "#102d30", color: "#fff", borderRadius: "8px", fontSize: "12px" } },
};

function CenteredMetric({ dataWithArc, centerX, centerY }: PieCustomLayerProps<unknown>) {
  const total = dataWithArc.reduce((sum, item) => sum + item.value, 0);
  return <text x={centerX} y={centerY} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 19, fontWeight: 750, fill: "#142c2e" }}>{formatCurrency(total)}</text>;
}

export default function AdvancedReports({ initialVehiclePerformance, initialExpenseAnalysis }: AdvancedReportsProps) {
  const { profile, isLoading: profileLoading, isError: profileError } = useFetchProfile();
  const { data: vehiclePerformance, isLoading: vehicleLoading, isError: vehicleError } = useFetchVehiclePerformanceReport(initialVehiclePerformance);
  const { data: expenseAnalysis, isLoading: expenseLoading, isError: expenseError } = useFetchExpenseAnalysisReport(initialExpenseAnalysis);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  if (profileLoading) return <AdvancedReportsSkeleton />;
  if (profileError) return <div className={styles.panel}><div className={styles.empty}><span className={styles.emptyVisual}><LockKeyhole size={26} /></span><div className={styles.emptyCopy}><strong>Não foi possível verificar seu plano.</strong><p>Atualize a página para tentar novamente.</p></div></div></div>;

  if (profile?.plan !== "PROFESSIONAL") return <>
    <div className={`${styles.panel} ${styles.gate}`}><div className={styles.gateCopy}><span className={styles.gateIcon} aria-hidden="true"><LockKeyhole size={26} /></span><div><h3>Uma visão mais detalhada da sua operação</h3><p>O plano Profissional libera desempenho por veículo, análise de despesas e exportação de dados.</p></div></div><button onClick={() => setIsUpgradeModalOpen(true)}>Conhecer o Profissional <ArrowRight size={17} /></button></div>
    <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} resourceName="relatórios avançados" monthlyPrice="R$ 49,90" annualPrice="R$ 499" annualSavings="Economize R$ 99,80" />
  </>;

  if (vehicleLoading || expenseLoading) return <AdvancedReportsSkeleton />;
  if (vehicleError || expenseError) return <div className={styles.panel}><div className={styles.empty}><span className={styles.emptyVisual}><ChartNoAxesCombined size={28} /></span><div className={styles.emptyCopy}><strong>Não foi possível carregar os relatórios avançados.</strong><p>Atualize a página para tentar novamente.</p></div></div></div>;

  const pieData = (expenseAnalysis?.byType ?? []).filter(item => item.value > 0).map(item => ({ id: item.name, label: item.name, value: item.value }));
  const barData = (expenseAnalysis?.byMonth ?? []).map(item => ({ month: item.month, Despesa: item.value }));
  const hasMonthlyExpenses = barData.some(item => item.Despesa > 0);

  return <div className={styles.advancedGrid}>
    <div className={styles.panel}><div className={styles.advancedPanelHeader}><h3>Desempenho por veículo</h3><p>Compare receita, despesas e resultado de cada veículo.</p></div>{vehiclePerformance?.length ? <div className={styles.tableScroll}><table className={styles.table}><thead><tr><th scope="col">Veículo</th><th scope="col">Receita</th><th scope="col">Despesas</th><th scope="col">Resultado</th></tr></thead><tbody>{vehiclePerformance.map(item => <tr key={item.vehicleId}><th scope="row">{item.vehicleInfo}</th><td className={styles.positive}>{formatCurrency(item.totalRevenue)}</td><td>{formatCurrency(item.totalExpenses)}</td><td className={item.profit >= 0 ? styles.positive : styles.negative}>{formatCurrency(item.profit)}</td></tr>)}</tbody></table></div> : <div className={styles.empty}><span className={styles.emptyVisual} aria-hidden="true"><ChartNoAxesCombined size={28} /></span><div className={styles.emptyCopy}><strong>Ainda não há desempenho por veículo.</strong><p>Os resultados aparecerão após registrar receitas ou despesas vinculadas aos veículos.</p></div></div>}</div>
    <div className={styles.panel}><div className={styles.advancedPanelHeader}><h3>Análise de despesas</h3><p>Entenda a composição dos custos e sua evolução mensal.</p></div><div className={styles.chartGrid}><div className={styles.chartCard}><h4>Por categoria</h4>{pieData.length ? <div className={styles.chartCanvas} role="img" aria-label="Gráfico de despesas por categoria"><ResponsivePie data={pieData} colors={["#286747", "#6ca987", "#9bbb6b", "#dfaa6e", "#7c9791", "#a5b7a9"]} margin={{ top: 20, right: 35, bottom: 35, left: 35 }} innerRadius={0.67} padAngle={1} cornerRadius={3} activeOuterRadiusOffset={5} arcLinkLabelsSkipAngle={12} arcLinkLabelsTextColor="#52655f" arcLinkLabelsThickness={1} arcLinkLabelsColor={{ from: "color" }} arcLabelsSkipAngle={12} arcLabelsTextColor="#102d30" theme={chartTheme} layers={["arcs", "arcLinkLabels", CenteredMetric]} tooltip={({ datum }) => <div>{datum.label}: {formatCurrency(datum.value)}</div>} /></div> : <div className={styles.chartEmpty}><ReceiptText size={22} /><span>Sem despesas por categoria neste período.</span></div>}</div><div className={styles.chartCard}><h4>Ao longo dos meses</h4>{hasMonthlyExpenses ? <div className={styles.chartCanvas} role="img" aria-label="Gráfico de despesas por mês"><ResponsiveBar data={barData} keys={["Despesa"]} indexBy="month" margin={{ top: 20, right: 12, bottom: 46, left: 70 }} padding={0.38} valueScale={{ type: "linear" }} indexScale={{ type: "band", round: true }} colors="#6ca987" borderRadius={3} axisTop={null} axisRight={null} axisBottom={{ tickSize: 0, tickPadding: 12, tickRotation: 0 }} axisLeft={{ tickSize: 0, tickPadding: 8, tickRotation: 0, format: value => new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(value as number) }} enableLabel={false} enableGridY theme={chartTheme} valueFormat={value => formatCurrency(value as number)} /></div> : <div className={styles.chartEmpty}><ChartNoAxesCombined size={22} /><span>Sem despesas mensais para analisar.</span></div>}</div></div></div>
  </div>;
}
