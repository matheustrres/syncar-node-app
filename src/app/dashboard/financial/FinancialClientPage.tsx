"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { Contract, Vehicle, Driver } from "@/types";
import {
  useAllContracts,
  useAllDrivers,
  useAllVehicles,
  useFetchPendingPayments,
  useFetchPaidPayments,
  useFetchRecentExpenses,
  PaymentWithRelations,
  ExpenseWithRelations,
} from "@/hooks/useData";
import Modal from "@/components/ui/Modal";
import PaymentForm from "@/components/forms/PaymentForm";
import ExpenseForm from "@/components/forms/ExpenseForm";
import {
  Plus,
  CheckCircle,
  Clock,
  TrendingDown,
  Edit,
  Trash2,
} from "lucide-react";
import FinancialSkeleton from "./FinancialSkeleton";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";

interface ClientPageProps {
  initialPendingPayments: { payments: PaymentWithRelations[]; total: number };
  initialPaidPayments: { payments: PaymentWithRelations[]; total: number };
  initialRecentExpenses: { expenses: ExpenseWithRelations[]; total: number };
  initialContracts: Contract[];
  initialDrivers: Driver[];
  initialVehicles: Vehicle[];
}

export default function FinancialClientPage({
  initialPendingPayments,
  initialPaidPayments,
  initialRecentExpenses,
  initialContracts,
  initialDrivers,
  initialVehicles,
}: ClientPageProps) {
  const [pendingPage, setPendingPage] = useState(1);
  const [paidPage, setPaidPage] = useState(1);
  const [expensesPage, setExpensesPage] = useState(1);
  const limit = 10;

  const {
    data: pendingData,
    isLoading: pendingLoading,
    mutate: mutatePending,
  } = useFetchPendingPayments(pendingPage, limit, initialPendingPayments);
  const {
    data: paidData,
    isLoading: paidLoading,
    mutate: mutatePaid,
  } = useFetchPaidPayments(paidPage, limit, initialPaidPayments);
  const {
    data: expensesData,
    isLoading: expensesLoading,
    mutate: mutateExpenses,
  } = useFetchRecentExpenses(expensesPage, limit, initialRecentExpenses);

  const { contracts } = useAllContracts(initialContracts);
  const { drivers } = useAllDrivers(initialDrivers);
  const { vehicles } = useAllVehicles(initialVehicles);

  const [modalType, setModalType] = useState<"payment" | "expense" | null>(
    null
  );
  const [editingExpense, setEditingExpense] =
    useState<ExpenseWithRelations | null>(null);
  const [expenseToDelete, setExpenseToDelete] =
    useState<ExpenseWithRelations | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenEditExpenseModal = (expense: ExpenseWithRelations) => {
    setEditingExpense(expense);
    setModalType("expense");
  };

  const handleDeleteExpenseClick = (expense: ExpenseWithRelations) => {
    setExpenseToDelete(expense);
  };

  const handleCloseDeleteExpenseModal = () => {
    setExpenseToDelete(null);
  };

  const handleConfirmDeleteExpense = async () => {
    if (expenseToDelete) {
      setIsDeleting(true);
      try {
        await fetch(`/api/expenses/${expenseToDelete.id}`, {
          method: "DELETE",
        });
        showToast("Despesa excluída com sucesso!", "success");
        setExpenseToDelete(null);
        mutateExpenses();
      } catch {
        showToast("Falha ao excluir despesa.", "error");
      }
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setEditingExpense(null);
  };

  const handleSave = async (apiPath: string, data: object) => {
    setIsSaving(true);
    const method = editingExpense ? "PUT" : "POST";
    const url = editingExpense ? `${apiPath}/${editingExpense.id}` : apiPath;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
      showToast(`Operação realizada com sucesso!`, "success");
      handleCloseModal();
      if (apiPath.includes("payments")) {
        mutatePending();
        mutatePaid();
      } else if (apiPath.includes("expenses")) {
        mutateExpenses();
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Ocorreu um erro",
        "error"
      );
    }
    setIsSaving(false);
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      await fetch(`/api/payments/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Pago",
          paymentDate: new Date().toISOString(),
        }),
      });
      showToast("Pagamento marcado como pago!", "success");
      mutatePending();
      mutatePaid();
    } catch {
      showToast("Falha ao marcar como pago.", "error");
    }
  };

  if (pendingLoading || paidLoading || expensesLoading) {
    return <FinancialSkeleton />;
  }

  const pendingPayments = pendingData?.payments || [];
  const pendingTotal = pendingData?.total || 0;
  const hasMorePending = pendingPayments.length < pendingTotal;

  const paidPayments = paidData?.payments || [];
  const paidTotal = paidData?.total || 0;
  const hasMorePaid = paidPayments.length < paidTotal;

  const recentExpenses = expensesData?.expenses || [];
  const expensesTotal = expensesData?.total || 0;
  const hasMoreExpenses = recentExpenses.length < expensesTotal;

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
              Pagamento manual
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
              Adicionar despesa
            </span>
            <span className="inline md:hidden whitespace-nowrap">Despesa</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Pending Payments */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full flex flex-col h-[75vh]">
          <h3 className="text-lg font-semibold mb-4 text-orange-700 flex items-center gap-2 flex-shrink-0">
            <Clock size={20} /> Pagamentos pendentes
          </h3>
          <div className="space-y-3 overflow-y-auto flex-grow">
            {pendingPayments.length > 0 ? (
              pendingPayments.map((payment) => {
                const isOverdue = new Date(payment.dueDate) < new Date();
                return (
                  <div
                    key={payment.id}
                    className={`p-4 rounded-lg border-l-4 min-h-[120px] flex flex-col justify-between ${
                      isOverdue
                        ? "bg-red-50 border-red-500"
                        : "bg-yellow-50 border-yellow-500"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-shrink min-w-0 overflow-hidden">
                        <p
                          className="font-semibold"
                          title={payment.contract.driver.name}
                        >
                          {payment.contract.driver.name.length > 20
                            ? `${payment.contract.driver.name.substring(
                                0,
                                20
                              )}...`
                            : payment.contract.driver.name}
                        </p>
                        <p
                          className="text-sm text-gray-500"
                          title={`${payment.contract.vehicle.plate} - ${payment.contract.vehicle.model}`}
                        >
                          {`${payment.contract.vehicle.plate} - ${payment.contract.vehicle.model}`
                            .length > 20
                            ? `${`${payment.contract.vehicle.plate} - ${payment.contract.vehicle.model}`.substring(
                                0,
                                20
                              )}...`
                            : `${payment.contract.vehicle.plate} - ${payment.contract.vehicle.model}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          Venc.:{" "}
                          {new Date(payment.dueDate).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                      <p className="font-bold text-gray-800 whitespace-nowrap">
                        R$ {payment.value.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-end items-center pt-2 border-t mt-2 h-10">
                      <button
                        onClick={() => handleMarkAsPaid(payment.id)}
                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                      >
                        Marcar como pago
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center pt-4">
                Nenhum pagamento pendente.
              </p>
            )}
            {hasMorePending && (
              <button
                onClick={() => setPendingPage((p) => p + 1)}
                className="w-full text-center text-blue-600 font-semibold p-2"
              >
                Carregar Mais
              </button>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full flex flex-col h-[75vh]">
          <h3 className="text-lg font-semibold mb-4 text-red-700 flex items-center gap-2 flex-shrink-0">
            <TrendingDown size={20} /> Despesas recentes
          </h3>
          <div className="space-y-3 overflow-y-auto flex-grow">
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500 min-h-[120px] flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-shrink min-w-0">
                      <p className="font-semibold truncate">{expense.type}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {expense.description} ({expense.vehicle?.plate || "N/A"}
                        )
                      </p>
                    </div>
                    <p className="font-bold text-red-600 whitespace-nowrap">
                      R$ {expense.value.toFixed(2)}
                    </p>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-end items-center h-10">
                    <div className="flex gap-2">
                      <button
                        title="Editar Despesa"
                        onClick={() => handleOpenEditExpenseModal(expense)}
                        className="text-indigo-600 p-2 rounded-full hover:bg-gray-100"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        title="Excluir Despesa"
                        onClick={() => handleDeleteExpenseClick(expense)}
                        className="text-red-600 p-2 rounded-full hover:bg-gray-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center pt-4">
                Nenhuma despesa registrada.
              </p>
            )}
            {hasMoreExpenses && (
              <button
                onClick={() => setExpensesPage((p) => p + 1)}
                className="w-full text-center text-blue-600 font-semibold p-2"
              >
                Carregar Mais
              </button>
            )}
          </div>
        </div>

        {/* Paid Payments History */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full flex flex-col h-[75vh]">
          <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center gap-2 flex-shrink-0">
            <CheckCircle size={20} /> Histórico de pagamentos
          </h3>
          <div className="space-y-3 overflow-y-auto flex-grow">
            {paidPayments.length > 0 ? (
              paidPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500 min-h-[120px] flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-shrink min-w-0">
                      <p className="font-semibold truncate">
                        {payment.contract.driver.name}
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
                    <p className="font-bold text-green-600 whitespace-nowrap">
                      R$ {payment.value.toFixed(2)}
                    </p>
                  </div>
                  <div className="h-10 border-t border-transparent mt-2"></div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center pt-4">
                Nenhum pagamento recebido ainda.
              </p>
            )}
            {hasMorePaid && (
              <button
                onClick={() => setPaidPage((p) => p + 1)}
                className="w-full text-center text-blue-600 font-semibold p-2"
              >
                Carregar Mais
              </button>
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
        title={editingExpense ? "Editar Despesa" : "Adicionar Despesa"}
      >
        <ExpenseForm
          initialData={editingExpense}
          isSaving={isSaving}
          vehicles={vehicles || []}
          onSave={(data) => handleSave("/api/expenses", data)}
          onCancel={handleCloseModal}
        />
      </Modal>

      <DeleteConfirmationModal
        isOpen={!!expenseToDelete}
        onClose={handleCloseDeleteExpenseModal}
        onConfirm={handleConfirmDeleteExpense}
        resourceName="despesa"
        resourceIdentifier={expenseToDelete?.description}
        isDeleting={isDeleting}
      />
    </div>
  );
}
