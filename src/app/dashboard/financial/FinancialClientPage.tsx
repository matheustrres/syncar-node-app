"use client";

import { useState } from "react";
import {
  Payment,
  Expense,
  Contract,
  Driver,
  Vehicle,
  WithoutBaseItem,
} from "@/types";
import {
  useFetchContracts,
  useFetchExpenses,
  useFetchDrivers,
  useFetchPayments,
  useFetchVehicles,
} from "@/hooks/useData";
import Modal from "@/components/ui/Modal";
import PaymentForm from "@/components/forms/PaymentForm";
import ExpenseForm from "@/components/forms/ExpenseForm";
import { Plus, CheckCircle, Clock, TrendingDown } from "lucide-react";
import FinancialSkeleton from "./FinancialSkeleton";

interface ClientPageProps {
  initialPayments: Payment[];
  initialExpenses: Expense[];
  initialContracts: Contract[];
  initialDrivers: Driver[];
  initialVehicles: Vehicle[];
}

export default function FinancialClientPage({
  initialPayments,
  initialExpenses,
  initialContracts,
  initialDrivers,
  initialVehicles,
}: ClientPageProps) {
  const {
    payments,
    isError: isPaymentsError,
    mutatePayments,
  } = useFetchPayments(initialPayments);
  const {
    expenses,
    isError: isExpensesError,
    mutateExpenses,
  } = useFetchExpenses(initialExpenses);
  const { contracts, isError: isContractsError } =
    useFetchContracts(initialContracts);
  const { drivers, isError: isDriversError } = useFetchDrivers(initialDrivers);
  const { vehicles, isError: isVehiclesError } =
    useFetchVehicles(initialVehicles);

  const [modalType, setModalType] = useState<"payment" | "expense" | null>(
    null
  );

  const handleCloseModal = () => setModalType(null);

  const handleSave = async (
    apiPath: string,
    data: WithoutBaseItem<Payment> | WithoutBaseItem<Expense>
  ) => {
    await fetch(apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    handleCloseModal();
    if (apiPath.includes("payments")) {
      mutatePayments();
    } else if (apiPath.includes("expenses")) {
      mutateExpenses();
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    await fetch(`/api/payments/${paymentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Pago",
        paymentDate: new Date().toISOString(),
      }),
    });
    mutatePayments();
  };

  const hasError =
    isPaymentsError ||
    isExpensesError ||
    isContractsError ||
    isDriversError ||
    isVehiclesError;
  if (!payments || !expenses || !contracts || !drivers || !vehicles) {
    return <FinancialSkeleton />;
  }
  if (hasError) {
    return (
      <div className="text-center text-red-500">
        Falha ao carregar dados financeiros.
      </div>
    );
  }

  const pendingPayments = (payments || [])
    .filter((p) => p.status === "Pendente")
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  const receivedPayments = (payments || [])
    .filter((p) => p.status === "Pago")
    .sort(
      (a, b) =>
        new Date(b.paymentDate || 0).getTime() -
        new Date(a.paymentDate || 0).getTime()
    );
  const recentExpenses = (expenses || []).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Financeiro</h2>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => setModalType("payment")}
            className="flex-1 sm:flex-none bg-gray-500 text-white px-3 py-2 md:px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-600"
          >
            <Plus size={20} />
            <span className="hidden md:inline whitespace-nowrap">
              Pagamento Manual
            </span>
            <span className="inline md:hidden whitespace-nowrap">
              Pagamento
            </span>
          </button>
          <button
            onClick={() => setModalType("expense")}
            className="flex-1 sm:flex-none bg-red-600 text-white px-3 py-2 md:px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700"
          >
            <Plus size={20} />
            <span className="hidden md:inline whitespace-nowrap">
              Adicionar Despesa
            </span>
            <span className="inline md:hidden whitespace-nowrap">Despesa</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
          <h3 className="h-8 text-lg font-semibold mb-4 text-orange-700 flex items-center gap-2">
            <Clock size={20} /> Pagamentos Pendentes
          </h3>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {pendingPayments.length > 0 ? (
              pendingPayments.map((payment) => {
                const contract = (contracts || []).find(
                  (c) => c.id === payment.contractId
                );
                const driver = (drivers || []).find(
                  (d) => d.id === contract?.driverId
                );
                const isOverdue = new Date(payment.dueDate) < new Date();
                return (
                  <div
                    key={payment.id}
                    className={`p-4 rounded-lg border-l-4 ${isOverdue ? "bg-red-50 border-red-500" : "bg-yellow-50 border-yellow-500"}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          {driver?.name || "Contrato inválido"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Venc.:{" "}
                          {new Date(payment.dueDate).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-800">
                          R$ {payment.value.toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleMarkAsPaid(payment.id)}
                          className="text-sm text-green-600 hover:text-green-800 font-medium mt-1"
                        >
                          Marcar como Pago
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center pt-4">
                Nenhum pagamento pendente.
              </p>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
          <h3 className="h-8 text-lg font-semibold mb-4 text-red-700 flex items-center gap-2">
            <TrendingDown size={20} /> Despesas Recentes
          </h3>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => {
                const vehicle = (vehicles || []).find(
                  (v) => v.id === expense.vehicleId
                );
                return (
                  <div
                    key={expense.id}
                    className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{expense.type}</p>
                      <p className="text-sm text-gray-500">
                        {expense.description} ({vehicle?.plate || "N/A"})
                      </p>
                    </div>
                    <p className="font-bold text-red-600">
                      R$ {expense.value.toFixed(2)}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center pt-4">
                Nenhuma despesa registrada.
              </p>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
          <h3 className="h-8 text-lg font-semibold mb-4 text-green-700 flex items-center gap-2">
            <CheckCircle size={20} /> Histórico de Pagamentos
          </h3>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {receivedPayments.length > 0 ? (
              receivedPayments.slice(0, 20).map((payment) => {
                const contract = (contracts || []).find(
                  (c) => c.id === payment.contractId
                );
                const driver = (drivers || []).find(
                  (d) => d.id === contract?.driverId
                );
                return (
                  <div
                    key={payment.id}
                    className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">
                        {driver?.name || "Contrato inválido"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Pago em:{" "}
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString(
                              "pt-BR"
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <p className="font-bold text-green-600">
                      R$ {payment.value.toFixed(2)}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center pt-4">
                Nenhum pagamento recebido ainda.
              </p>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalType === "payment"}
        onClose={handleCloseModal}
        title="Pagamento Manual"
      >
        <PaymentForm
          contracts={contracts || []}
          drivers={drivers || []}
          vehicles={vehicles || []}
          onSave={(data) => handleSave("/api/payments", data)}
          onCancel={handleCloseModal}
        />
      </Modal>
      <Modal
        isOpen={modalType === "expense"}
        onClose={handleCloseModal}
        title="Adicionar Despesa"
      >
        <ExpenseForm
          vehicles={vehicles || []}
          onSave={(data) => handleSave("/api/expenses", data)}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}
