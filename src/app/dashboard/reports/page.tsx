"use client";

import { useState, useEffect, useMemo } from "react";
import { Payment, Expense, Contract, Driver, Vehicle } from "@/types";
import { CheckCircle } from "lucide-react";
import ReportsSkeleton from "./ReportsSkeleton";

export default function ReportsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [pRes, eRes, cRes, dRes, vRes] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/expenses"),
        fetch("/api/contracts"),
        fetch("/api/drivers"),
        fetch("/api/vehicles"),
      ]);
      setPayments(await pRes.json());
      setExpenses(await eRes.json());
      setContracts(await cRes.json());
      setDrivers(await dRes.json());
      setVehicles(await vRes.json());
    } catch (error) {
      console.error("Falha ao carregar dados para relatórios", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, []);

  const monthlyCashFlow = useMemo(() => {
    const cashFlowData: {
      [key: string]: { month: string; revenue: number; expense: number };
    } = {};
    payments.forEach((p) => {
      if (p.status === "Pago" && p.paymentDate) {
        const month = p.paymentDate.toString().substring(0, 7); // YYYY-MM
        if (!cashFlowData[month]) {
          cashFlowData[month] = { month, revenue: 0, expense: 0 };
        }
        cashFlowData[month].revenue += p.value;
      }
    });
    expenses.forEach((e) => {
      const month = e.date.substring(0, 7);
      if (!cashFlowData[month]) {
        cashFlowData[month] = { month, revenue: 0, expense: 0 };
      }
      cashFlowData[month].expense += e.value;
    });
    return Object.values(cashFlowData).sort((a, b) =>
      b.month.localeCompare(a.month)
    );
  }, [payments, expenses]);

  const overduePayments = useMemo(() => {
    return payments
      .filter(
        (p) => p.status === "Pendente" && new Date(p.dueDate) < new Date()
      )
      .map((payment) => {
        const contract = contracts.find((c) => c.id === payment.contractId);
        const driver = drivers.find((d) => d.id === contract?.driverId);
        const vehicle = vehicles.find((v) => v.id === contract?.vehicleId);
        const daysOverdue = Math.floor(
          (new Date().getTime() - new Date(payment.dueDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return {
          ...payment,
          driverName: driver?.name || "N/A",
          vehicleInfo: vehicle ? `${vehicle.plate} - ${vehicle.model}` : "N/A",
          daysOverdue,
        };
      });
  }, [payments, contracts, drivers, vehicles]);

  const driverSummaries = useMemo(() => {
    return drivers.map((driver) => {
      const driverContracts = contracts.filter((c) => c.driverId === driver.id);
      const contractIds = driverContracts.map((c) => c.id);
      const totalPaid = payments
        .filter(
          (p) => contractIds.includes(p.contractId) && p.status === "Pago"
        )
        .reduce((sum, p) => sum + p.value, 0);
      const activeContract = driverContracts.find((c) => c.status === "Ativo");
      const vehicle = vehicles.find((v) => v.id === activeContract?.vehicleId);
      return {
        driverId: driver.id,
        driverName: driver.name,
        totalPaid,
        vehicleInfo: vehicle ? `Veículo: ${vehicle.plate}` : "",
      };
    });
  }, [drivers, contracts, payments, vehicles]);

  const handleMarkAsPaid = async (paymentId: string) => {
    await fetch(`/api/payments/${paymentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Pago",
        paymentDate: new Date().toISOString(),
      }),
    });
    await fetchData();
  };

  if (loading) return <ReportsSkeleton />;

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
                      className={`px-6 py-4 whitespace-nowrap font-bold ${profit >= 0 ? "text-green-700" : "text-red-700"}`}
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
                      Marcar como pago
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
                <p className="text-sm text-gray-600">Total Pago</p>
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
