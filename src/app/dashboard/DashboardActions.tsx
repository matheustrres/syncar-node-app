"use client";

import { Download } from "lucide-react";
import styles from "./dashboard.module.css";

type Stats = {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  overduePaymentsCount: number;
  rentedVehiclesCount: number;
  availableVehiclesCount: number;
  totalVehicles: number;
};

export default function DashboardActions({ stats }: { stats: Stats }) {
  function exportSummary() {
    const rows = [
      ["Indicador", "Valor"],
      ["Veículos cadastrados", stats.totalVehicles],
      ["Veículos alugados", stats.rentedVehiclesCount],
      ["Veículos disponíveis", stats.availableVehiclesCount],
      ["Cobranças em atraso", stats.overduePaymentsCount],
      ["Receitas pagas (BRL)", stats.totalRevenue],
      ["Despesas registradas (BRL)", stats.totalExpenses],
      ["Resultado acumulado (BRL)", stats.netProfit],
    ];
    const csv = rows.map((row) => row.map((value) => {
      const text = typeof value === "number" ? value.toLocaleString("pt-BR", { useGrouping: false }) : value;
      return `"${String(text).replaceAll('"', '""')}"`;
    }).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "syncar-resumo-acumulado.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <button type="button" className={styles.exportButton} onClick={exportSummary}><Download size={17} aria-hidden="true" /> Exportar resumo</button>;
}
