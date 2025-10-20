"use client";

import { useState, useEffect } from "react";
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
  Check,
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
  } = useFetchPendingPayments(pendingPage, limit);
  const {
    data: paidData,
    isLoading: paidLoading,
    mutate: mutatePaid,
  } = useFetchPaidPayments(paidPage, limit);
  const {
    data: expensesData,
    isLoading: expensesLoading,
    mutate: mutateExpenses,
  } = useFetchRecentExpenses(expensesPage, limit);

  const [accumulatedExpenses, setAccumulatedExpenses] = useState<ExpenseWithRelations[]>(initialRecentExpenses.expenses);
  const [accumulatedPending, setAccumulatedPending] = useState<PaymentWithRelations[]>(initialPendingPayments.payments);
  const [accumulatedPaid, setAccumulatedPaid] = useState<PaymentWithRelations[]>(initialPaidPayments.payments);

  useEffect(() => {
    if (expensesData?.expenses && expensesPage > 1) {
      setAccumulatedExpenses((prev) => [...prev, ...expensesData.expenses]);
    }
  }, [expensesData, expensesPage]);

  useEffect(() => {
    if (pendingData?.payments && pendingPage > 1) {
      setAccumulatedPending((prev) => [...prev, ...pendingData.payments]);
    }
  }, [pendingData, pendingPage]);

  useEffect(() => {
    if (paidData?.payments && paidPage > 1) {
      setAccumulatedPaid((prev) => [...prev, ...paidData.payments]);
    }
  }, [paidData, paidPage]);

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
    if (!expenseToDelete) return;

    const expenseToRemove = expenseToDelete;
    setExpenseToDelete(null);
    setAccumulatedExpenses((prev) =>
      prev.filter((exp) => exp.id !== expenseToRemove.id)
    );

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/expenses/${expenseToRemove.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha na API");
      showToast("Despesa excluída com sucesso!", "success");
      mutateExpenses(); // Revalidate
    } catch {
      showToast("Falha ao excluir despesa. Revertendo...", "error");
      setAccumulatedExpenses((prev) => [expenseToRemove, ...prev]);
    }
    setIsDeleting(false);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setEditingExpense(null);
  };

  const handleSave = async (apiPath: string, data: object) => {
    const isExpense = apiPath.includes("expenses");
    const editingItem = isExpense ? editingExpense : null; // Assuming only expenses can be edited for now

    setIsSaving(true);

    // Optimistic UI update
    handleCloseModal();
    if (isExpense) {
      if (editingItem) {
        setAccumulatedExpenses((prev) =>
          prev.map((exp) => (exp.id === editingItem.id ? { ...exp, ...data } : exp))
        );
      } else {
        // For new expenses, we need a temporary ID
        const tempId = `temp-${Date.now()}`;
        const newExpense = { ...(data as any), id: tempId };
        setAccumulatedExpenses((prev) => [newExpense, ...prev]);
      }
    } else {
      // For new payments
      const tempId = `temp-${Date.now()}`;
      const newPayment = { ...(data as any), id: tempId };
      setAccumulatedPending((prev) => [newPayment, ...prev]);
    }

    try {
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem ? `${apiPath}/${editingItem.id}` : apiPath;
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

      // Revalidate with the server
      if (isExpense) {
        mutateExpenses();
      } else {
        mutatePending();
        mutatePaid();
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Ocorreu um erro",
        "error"
      );
      // Revert optimistic update on failure
      if (isExpense) {
        if (editingItem) {
          // Simple revert, could be improved to store original item
          mutateExpenses();
        } else {
          setAccumulatedExpenses((prev) => prev.filter((exp) => !exp.id.startsWith("temp-")));
        }
      } else {
        setAccumulatedPending((prev) => prev.filter((p) => !p.id.startsWith("temp-")));
      }
    }
    setIsSaving(false);
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    const paymentToMove = accumulatedPending.find((p) => p.id === paymentId);
    if (!paymentToMove) return;

    setAccumulatedPending((prev) => prev.filter((p) => p.id !== paymentId));
    setAccumulatedPaid((prev) => [
      {
        ...paymentToMove,
        status: "Pago",
        paymentDate: new Date().toISOString(),
      },
      ...prev,
    ]);

    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Pago",
          paymentDate: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Falha na API");
      showToast("Pagamento marcado como pago!", "success");
      mutatePending();
      mutatePaid();
    } catch {
      showToast("Falha ao marcar como pago. Revertendo...", "error");
      setAccumulatedPaid((prev) => prev.filter((p) => p.id !== paymentId));
      setAccumulatedPending((prev) => [paymentToMove, ...prev]);
    }
  };

  if (pendingLoading || paidLoading || expensesLoading) {
    return <FinancialSkeleton />;
  }

  const pendingTotal = pendingData?.total || 0;
  const hasMorePending = accumulatedPending.length < pendingTotal;

  const paidTotal = paidData?.total || 0;
  const hasMorePaid = accumulatedPaid.length < paidTotal;

  const expensesTotal = expensesData?.total || 0;
  const hasMoreExpenses = accumulatedExpenses.length < expensesTotal;

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
            {accumulatedPending.length > 0 ? (
              accumulatedPending.map((payment) => {
                const isOverdue = new Date(payment.dueDate) < new Date();
                return (
                  <div
                    key={payment.id}
                    className={`p-4 rounded-lg border-l-4 h-[120px] flex flex-col ${
                      isOverdue
                        ? "bg-red-50 border-red-500"
                        : "bg-yellow-50 border-yellow-500"
                    }`}
                  >
                    <div className="flex-grow flex justify-between items-start gap-4">
                      <div className="flex-shrink min-w-0 overflow-hidden">
                        <p
                          className="font-semibold truncate"
                          title={payment.contract.driver.name}
                        >
                          {payment.contract.driver.name}
                        </p>
                        <p
                          className="text-sm text-gray-500 truncate"
                          title={`${payment.contract.vehicle.plate} - ${payment.contract.vehicle.model}`}
                        >
                          {`${payment.contract.vehicle.plate} - ${payment.contract.vehicle.model}`}
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
                    <div className="border-t mt-2 flex justify-end items-center h-10">
                      <div className="flex">
                        <button
                          onClick={() => handleMarkAsPaid(payment.id)}
                          className="text-sm text-green-600 hover:text-green-800 font-semibold flex items-center gap-2"
                        >
                          <Check size={16} />
                          <span className="hidden md:inline">Marcar como Pago</span>
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
            {accumulatedExpenses.length > 0 ? (
              accumulatedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500 h-[120px] flex flex-col"
                >
                  <div className="flex-grow flex justify-between items-start gap-4">
                    <div className="flex-shrink min-w-0">
                      <p className="font-semibold truncate">{expense.type}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {expense.description} ({expense.vehicle?.plate || "N/A"})
                      </p>
                      <p className="text-sm text-gray-500">&nbsp;</p>
                    </div>
                    <p className="font-bold text-red-600 whitespace-nowrap">
                      R$ {expense.value.toFixed(2)}
                    </p>
                  </div>
                  <div className="border-t mt-2 flex justify-end items-center h-10">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleOpenEditExpenseModal(expense)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-2"
                      >
                        <Edit size={16} />
                        <span className="hidden md:inline">Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteExpenseClick(expense)}
                        className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        <span className="hidden md:inline">Excluir</span>
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
            {accumulatedPaid.length > 0 ? (
              accumulatedPaid.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500 h-[120px] flex flex-col"
                >
                  <div className="flex-grow flex justify-between items-start gap-4">
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
                      <p className="text-sm text-gray-500">&nbsp;</p>
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
