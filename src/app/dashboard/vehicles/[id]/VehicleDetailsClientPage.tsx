"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { Vehicle, Expense, WithoutBaseItem } from "@/types";
import { useFetchVehicleById, useFetchVehicleExpenses } from "@/hooks/useData";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import VehicleForm from "@/components/forms/VehicleForm";
import VehicleDetailsSkeleton from "./VehicleDetailsSkeleton";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import DataTable, { Column } from "@/components/ui/DataTable";
import DataTableSkeleton from "@/components/ui/DataTableSkeleton";
import ExpenseForm from "@/components/forms/ExpenseForm";
import UpgradePlaceholder from "@/components/ui/UpgradePlaceholder";
import UpgradeModal from "@/components/ui/UpgradeModal";

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="py-2">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-md text-gray-900">{value}</p>
  </div>
);

interface ClientPageProps {
  id: string;
  initialVehicle: Vehicle;
}

export default function VehicleDetailsClientPage({
  id,
  initialVehicle,
}: ClientPageProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const {
    data: vehicle,
    isError,
    mutate: mutateVehicle,
  } = useFetchVehicleById(id, initialVehicle);

  const {
    expenses,
    isLoading: isLoadingExpenses,
    mutate: mutateExpenses,
  } = useFetchVehicleExpenses(id);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for expense modals
  const [isExpenseFormModalOpen, setIsExpenseFormModalOpen] = useState(false);
  const [isDeleteExpenseModalOpen, setIsDeleteExpenseModalOpen] =
    useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [isDeletingExpense, setIsDeletingExpense] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const handleOpenEditExpenseModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsExpenseFormModalOpen(true);
  };

  const handleOpenDeleteExpenseModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteExpenseModalOpen(true);
  };

  // TODO: Implementar a lógica de ordenação e edição/exclusão de despesas se necessário.
  const expenseColumns: Column<Expense>[] = [
    {
      header: "Data",
      accessor: (item) => new Date(item.date).toLocaleDateString("pt-BR"),
    },
    {
      header: "Tipo",
      accessor: "type",
    },
    {
      header: "Descrição",
      accessor: "description",
    },
    {
      header: "Valor",
      accessor: (item) =>
        item.value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
    },
  ];

  const handleSave = async (formData: WithoutBaseItem<Vehicle>) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
      const updatedVehicle = { ...vehicle, ...formData } as Vehicle;
      mutateVehicle(updatedVehicle, false);
      showToast("Veículo atualizado com sucesso!", "success");
      setIsFormModalOpen(false);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Ocorreu um erro",
        "error"
      );
    }
    setIsSaving(false);
  };

  const handleSaveExpense = async (
    expenseData: Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    if (!selectedExpense) return;
    setIsSavingExpense(true);
    try {
      const response = await fetch(`/api/expenses/${selectedExpense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
      showToast("Despesa atualizada com sucesso!", "success");
      setIsExpenseFormModalOpen(false);
      mutateExpenses();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Ocorreu um erro",
        "error"
      );
    }
    setIsSavingExpense(false);
  };

  const handleConfirmDeleteExpense = async () => {
    if (!selectedExpense) return;
    setIsDeletingExpense(true);
    try {
      await fetch(`/api/expenses/${selectedExpense.id}`, { method: "DELETE" });
      showToast("Despesa excluída com sucesso!", "success");
      setIsDeleteExpenseModalOpen(false);
      mutateExpenses();
    } catch {
      showToast("Falha ao excluir despesa.", "error");
    }
    setIsDeletingExpense(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      showToast("Veículo excluído com sucesso!", "success");
      setIsDeleteModalOpen(false);
      router.push("/dashboard/vehicles");
    } catch {
      showToast("Falha ao excluir veículo.", "error");
    }
    setIsDeleting(false);
  };

  if (isError) {
    return (
      <ErrorDisplay
        errorMessage="Falha ao carregar dados do veículo."
        onRetry={mutateVehicle}
      />
    );
  }

  if (!vehicle && !isError) return <VehicleDetailsSkeleton />;
  if (!vehicle) return <div>Veículo não encontrado.</div>;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
      >
        <ArrowLeft size={20} />
        Voltar para a lista de veículos
      </button>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {vehicle.brand} {vehicle.model}
            </h2>
            <p className="text-lg text-gray-600">{vehicle.plate}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                vehicle.status === "Disponível"
                  ? "bg-green-100 text-green-800"
                  : vehicle.status === "Manutenção"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {vehicle.status}
            </span>
            <button
              onClick={() => setIsFormModalOpen(true)}
              title="Editar Veículo"
              className="p-2 rounded-full text-indigo-600 hover:bg-gray-100"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              title="Excluir veículo"
              className="p-2 rounded-full hover:bg-gray-100 text-red-600"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="border-t mt-6 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Detalhes do veículo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <DetailItem label="Marca" value={vehicle.brand} />
            <DetailItem label="Modelo" value={vehicle.model} />
            <DetailItem label="Placa" value={vehicle.plate} />
            <DetailItem label="Ano" value={vehicle.year} />
            <DetailItem label="Cor" value={vehicle.color} />
            <DetailItem
              label="Quilometragem"
              value={`${vehicle.km.toLocaleString("pt-BR")} km`}
            />
            <DetailItem label="RENAVAM" value={vehicle.renavam} />
            <DetailItem label="Chassi" value={vehicle.chassis} />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Editar Veículo"
        size="4xl"
      >
        <VehicleForm
          initialData={vehicle}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        resourceName="veículo"
        resourceIdentifier={vehicle.plate}
        isDeleting={isDeleting}
      />

      {selectedExpense && (
        <>
          <Modal
            isOpen={isExpenseFormModalOpen}
            onClose={() => setIsExpenseFormModalOpen(false)}
            title="Editar Despesa"
            size="4xl"
          >
            <ExpenseForm
              initialData={selectedExpense}
              vehicles={[vehicle]} // Pass only the current vehicle
              isSaving={isSavingExpense}
              onSave={handleSaveExpense}
              onCancel={() => setIsExpenseFormModalOpen(false)}
              isVehicleLocked={true}
            />
          </Modal>
          <DeleteConfirmationModal
            isOpen={isDeleteExpenseModalOpen}
            onClose={() => setIsDeleteExpenseModalOpen(false)}
            onConfirm={handleConfirmDeleteExpense}
            resourceName="despesa"
            resourceIdentifier={selectedExpense.description}
            isDeleting={isDeletingExpense}
          />
        </>
      )}

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Histórico de despesas
        </h3>
        {session?.user?.plan === "BASIC" ? (
          <>
            <UpgradePlaceholder
              featureName="Histórico de despesas"
              onUpgradeClick={() => setIsUpgradeModalOpen(true)}
            >
              <DataTableSkeleton columns={4} />
            </UpgradePlaceholder>
            <UpgradeModal
              isOpen={isUpgradeModalOpen}
              onClose={() => setIsUpgradeModalOpen(false)}
              resourceName="Histórico de despesas"
              monthlyPrice="R$ 49,90"
              annualPrice="R$ 499"
              annualSavings="Economize R$ 99,80"
            />
          </>
        ) : isLoadingExpenses ? (
          <DataTableSkeleton columns={4} />
        ) : expenses.length > 0 ? (
          <DataTable
            columns={expenseColumns}
            data={expenses}
            onRowClick={() => {}}
            onEdit={handleOpenEditExpenseModal}
            onDelete={handleOpenDeleteExpenseModal}
            sortColumn="date"
            sortDirection="desc"
            onSort={() => {}}
          />
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
            Nenhuma despesa registrada para este veículo.
          </div>
        )}
      </div>
    </div>
  );
}
