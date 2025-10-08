"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DollarSign, TrendingUp, AlertCircle, Car } from "lucide-react";
import DashboardSkeleton from "./DashboardSkeleton";

type Vehicle = {
  id: string;
  plate: string;
  model: string;
  status: string;
};

type Driver = {
  id: string;
  name: string;
};

type Contract = {
  id: string;
  vehicleId: string;
  driverId: string;
};

type Payment = {
  id: string;
  contractId: string;
  value: number;
  status: "Pago" | "Pendente";
  dueDate: string;
};

type Expense = {
  id: string;
  value: number;
};

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          vehiclesRes,
          driversRes,
          contractsRes,
          paymentsRes,
          expensesRes,
        ] = await Promise.all([
          fetch("/api/vehicles"),
          fetch("/api/drivers"),
          fetch("/api/contracts"),
          fetch("/api/payments"),
          fetch("/api/expenses"),
        ]);
        if (
          !vehiclesRes.ok ||
          !driversRes.ok ||
          !contractsRes.ok ||
          !paymentsRes.ok ||
          !expensesRes.ok
        ) {
          throw new Error("Falha ao carregar os dados do dashboard.");
        }
        const vehiclesData = await vehiclesRes.json();
        const driversData = await driversRes.json();
        const contractsData = await contractsRes.json();
        const paymentsData = await paymentsRes.json();
        const expensesData = await expensesRes.json();
        setVehicles(vehiclesData);
        setDrivers(driversData);
        setContracts(contractsData);
        setPayments(paymentsData);
        setExpenses(expensesData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const dashboardStats = useMemo(() => {
    const totalRevenue = payments
      .filter((p) => p.status === "Pago")
      .reduce((sum, p) => sum + p.value, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.value, 0);
    const netProfit = totalRevenue - totalExpenses;
    const overduePayments = payments.filter(
      (p) => p.status === "Pendente" && new Date(p.dueDate) < new Date()
    );
    const pendingPayments = payments.filter((p) => p.status === "Pendente");
    const rentedVehiclesCount = vehicles.filter(
      (v) => v.status === "Alugado"
    ).length;
    const availableVehiclesCount = vehicles.filter(
      (v) => v.status === "Disponível"
    ).length;
    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      overduePayments,
      pendingPayments,
      rentedVehiclesCount,
      availableVehiclesCount,
      totalVehicles: vehicles.length,
    };
  }, [payments, expenses, vehicles]);

  const getPaymentDetails = (payment: Payment) => {
    const contract = contracts.find((c) => c.id === payment.contractId);
    if (!contract) return { driverName: "N/A", vehicleInfo: "N/A" };
    const driver = drivers.find((d) => d.id === contract.driverId);
    const vehicle = vehicles.find((v) => v.id === contract.vehicleId);
    return {
      driverName: driver?.name || "Motorista não encontrado",
      vehicleInfo: vehicle
        ? `${vehicle.plate} - ${vehicle.model}`
        : "Veículo não encontrado",
    };
  };

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return <div className="text-red-500 text-center">Erro: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Receita total</p>
          <p className="text-2xl font-bold text-gray-800">
            R$ {dashboardStats.totalRevenue.toFixed(2)}
          </p>
          <DollarSign
            className="absolute top-4 right-4 text-blue-300"
            size={32}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Despesas totais</p>
          <p className="text-2xl font-bold text-gray-800">
            R$ {dashboardStats.totalExpenses.toFixed(2)}
          </p>
          <TrendingUp
            className="absolute top-4 right-4 text-red-300"
            size={32}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Lucro líquido</p>
          <p
            className={`text-2xl font-bold ${dashboardStats.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            R$ {dashboardStats.netProfit.toFixed(2)}
          </p>
          <TrendingUp
            className="absolute top-4 right-4 text-green-300"
            size={32}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <p className="text-sm text-gray-600">Pagamentos atrasados</p>
          <p className="text-2xl font-bold text-gray-800">
            {dashboardStats.overduePayments.length}
          </p>
          <AlertCircle
            className="absolute top-4 right-4 text-orange-300"
            size={32}
          />
        </div>
      </div>

      {/* Pagamentos Pendentes e Status da Frota */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna de Pagamentos Pendentes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="text-orange-500" />
            Pagamentos Pendentes
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {dashboardStats.pendingPayments.length > 0 ? (
              dashboardStats.pendingPayments.map((payment) => {
                const details = getPaymentDetails(payment);
                const isOverdue = new Date(payment.dueDate) < new Date();
                return (
                  <div
                    key={payment.id}
                    className={`p-4 rounded-lg border-l-4 ${isOverdue ? "bg-red-50 border-red-500" : "bg-yellow-50 border-yellow-500"}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{details.driverName}</p>
                        <p className="text-sm text-gray-600">
                          {details.vehicleInfo}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Vencimento:{" "}
                          {new Date(payment.dueDate).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          R$ {payment.value.toFixed(2)}
                        </p>
                        {isOverdue && (
                          <span className="text-xs text-red-600 font-medium">
                            ATRASADO
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nenhum pagamento pendente.
              </p>
            )}
          </div>
        </div>

        {/* Coluna de Status da Frota */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Car className="text-blue-500" />
            Status da frota
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="font-medium text-green-800">
                Veículos alugados
              </span>
              <span className="text-2xl font-bold text-green-600">
                {dashboardStats.rentedVehiclesCount}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-800">
                Veículos disponíveis
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {dashboardStats.availableVehiclesCount}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg mt-4 border-t pt-4">
              <span className="font-medium text-gray-800">
                Total de veículos
              </span>
              <span className="text-2xl font-bold text-gray-600">
                {dashboardStats.totalVehicles}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
