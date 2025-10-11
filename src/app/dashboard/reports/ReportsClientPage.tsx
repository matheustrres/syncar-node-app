"use client";

import { CheckCircle } from "lucide-react";
import {
  CashFlowReportItem,
  DriverSummaryReportItem,
  OverduePaymentReportItem,
} from "@/types";
import {
  useFetchCashFlow,
  useFetchDriverSummary,
  useFetchOverduePayments,
} from "@/hooks/useData";
import ReportsSkeleton from "./ReportsSkeleton";

interface ClientPageProps {
  initialCashFlow: CashFlowReportItem[];
  initialOverduePayments: OverduePaymentReportItem[];
  initialDriverSummary: DriverSummaryReportItem[];
}

export default function ReportsClientPage({
  initialCashFlow,
  initialOverduePayments,
  initialDriverSummary,
}: ClientPageProps) {
  const { data: monthlyCashFlow, isError: isCashFlowError, mutate: mutateCashFlow } = useFetchCashFlow(initialCashFlow);
  const { data: overduePayments, isError: isOverdueError, mutate: mutateOverdue } = useFetchOverduePayments(initialOverduePayments);
  const { data: driverSummaries, isError: isSummaryError, mutate: mutateSummary } = useFetchDriverSummary(initialDriverSummary);

  const handleMarkAsPaid = async (paymentId: string) => {
    await fetch(`/api/payments/${paymentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Pago",
        paymentDate: new Date().toISOString(),
      }),
    });
    // Revalidate all reports as they are all affected by a payment
    mutateCashFlow();
    mutateOverdue();
    mutateSummary();
  };

  const isLoading = !monthlyCashFlow || !overduePayments || !driverSummaries;
  const hasError = isCashFlowError || isOverdueError || isSummaryError;

  if (isLoading) {
    return <ReportsSkeleton />;
  }

  if (hasError) {
    return (
      <div className="text-center text-red-500">
        Falha ao carregar dados para os relatórios.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Relatórios</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4">Fluxo de caixa mensal</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mês
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Receita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Despesas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Lucro
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyCashFlow.map(({ month, revenue, expense }) => {
                const profit = revenue - expense;
                return (
                  <tr key={month}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {new Date(`${month}-02`).toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600">
                      R$ {revenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600">
                      R$ {expense.toFixed(2)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-bold ${
                        profit >= 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      R$ {profit.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4 text-orange-700">
          Relatório de inadimplência
        </h3>
        <div className="space-y-4">
          {overduePayments.length > 0 ? (
            overduePayments.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500"
              >
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{p.driverName}</p>
                    <p className="text-sm text-gray-600">{p.vehicleInfo}</p>
                    <p className="text-sm text-gray-600">
                      Período:{" "}
                      {new Date(p.weekStart).toLocaleDateString("pt-BR")} -{" "}
                      {new Date(p.weekEnd).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-sm font-medium text-red-600 mt-1">
                      Vencimento:{" "}
                      {new Date(p.dueDate).toLocaleDateString("pt-BR")} (
                      {p.daysOverdue} dias de atraso)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">
                      R$ {p.value.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleMarkAsPaid(p.id)}
                      className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Marcar como Pago
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="mx-auto mb-2 text-green-500" size={48} />
              <p className="text-lg font-medium">Nenhum pagamento atrasado!</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Resumo por motorista</h3>
        <div className="space-y-3">
          {driverSummaries.map((summary) => (
            <div
              key={summary.driverId}
              className="p-4 bg-blue-50 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-lg">{summary.driverName}</p>
                <p className="text-sm text-gray-600">{summary.vehicleInfo}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total pago</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {summary.totalPaid.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}