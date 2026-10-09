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
import styles from "../../detailPages.module.css";

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className={styles.detailItem}>
    <p className={styles.detailLabel}>{label}</p>
    <p className={styles.detailValue}>{value}</p>
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
    <div className={styles.page}>
      <button
        onClick={() => router.back()}
        className={styles.backLink}
      >
        <ArrowLeft size={20} />
        Voltar para a lista de veículos
      </button>

      <section className={styles.panel}>
        <header className={styles.detailHeader}>
          <div className={styles.identity}>
            <h1 className={styles.title}>
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className={styles.subtitle}>{vehicle.plate}</p>
          </div>
          <div className={styles.headerActions}>
            <span className={`${styles.status} ${vehicle.status === "Disponível" ? styles.success : vehicle.status === "Manutenção" ? styles.warning : styles.info}`}>
              {vehicle.status}
            </span>
            <button
              onClick={() => setIsFormModalOpen(true)}
              title="Editar veículo"
              className={styles.iconButton}
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              title="Excluir veículo"
              className={`${styles.iconButton} ${styles.deleteButton}`}
            >
              <Trash2 size={20} />
            </button>
          </div>
        </header>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Detalhes do veículo
          </h2>
          <div className={styles.detailGrid}>
            <DetailItem label="Marca" value={vehicle.brand} />
            <DetailItem label="Modelo" value={vehicle.model} />
            <DetailItem label="Placa" value={vehicle.plate} />
            <DetailItem label="Ano" value={vehicle.year} />
            <DetailItem label="Cor" value={vehicle.color} />
            <DetailItem
              label="Quilometragem"
              value={`${vehicle.km.toLocaleString("pt-BR")} km`}
            />
            <DetailItem label="RENAVAM" value={vehicle.renavam || "Não informado"} />
            <DetailItem label="Chassi" value={vehicle.chassis || "Não informado"} />
          </div>
        </div>
      </section>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Editar veículo"
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

      <section className={styles.history}>
        <h2 className={styles.sectionTitle}>
          Histórico de despesas
        </h2>
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
          <div className={styles.empty}>
            Nenhuma despesa registrada para este veículo.
          </div>
        )}
      </section>
    </div>
  );
}
