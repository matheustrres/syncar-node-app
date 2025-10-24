"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { Driver, WithoutBaseItem } from "@/types";
import { DriverFilters, useFetchDrivers } from "@/hooks/useData";
import useCrud from "@/hooks/useCrud";
import Modal from "@/components/ui/Modal";
import DriverForm from "@/components/forms/DriverForm";
import {
  Plus,
  Edit,
  Trash2,
  User,
  FileText,
  Phone,
  Mail,
  CheckSquare,
  Download,
} from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import DriversSkeleton from "./DriversSkeleton";
import UpgradeModal from "@/components/ui/UpgradeModal";
import AdvancedFilterBar, {
  FilterConfig,
} from "@/components/ui/AdvancedFilterBar";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import EmptyState from "@/components/ui/EmptyState";
import UpgradePlaceholder from "@/components/ui/UpgradePlaceholder";

const columns: Column<Driver>[] = [
  {
    header: "Nome",
    accessor: "name",
    className: "font-medium text-gray-900",
    sortable: true,
  },
  { header: "CPF", accessor: "cpf", sortable: true },
  { header: "Telefone", accessor: "phone", sortable: true },
  {
    header: "Status",
    accessor: (driver) => (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          driver.status === "Ativo"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {driver.status}
      </span>
    ),
    sortable: true,
  },
];

const statusOptions = [
  { value: "", label: "Todos os status" },
  { value: "Ativo", label: "Ativo" },
  { value: "Inativo", label: "Inativo" },
];

interface ClientPageProps {
  initialDrivers: Driver[];
  total: number;
  userPlan: string;
}

const filtersConfig: FilterConfig[] = [
  {
    id: "searchName",
    label: "Buscar por nome",
    type: "text",
    field: "name",
    placeholder: "Ex: João Silva",
    icon: User,
  },
  {
    id: "searchCpf",
    label: "Buscar por CPF",
    type: "text",
    field: "cpf",
    placeholder: "Ex: 000.000.000-00",
    icon: FileText,
  },
  {
    id: "searchPhone",
    label: "Buscar por telefone",
    type: "text",
    field: "phone",
    placeholder: "Ex: (00) 90000-0000",
    icon: Phone,
  },
  {
    id: "searchEmail",
    label: "Buscar por email",
    type: "text",
    field: "email",
    placeholder: "Ex: joao@exemplo.com",
    icon: Mail,
  },
  {
    id: "status",
    label: "Status",
    type: "select",
    field: "status",
    options: statusOptions,
    placeholder: "Todos os status",
    icon: CheckSquare,
  },
];

export default function DriversClientPage({
  initialDrivers,

  total: initialTotal,

  userPlan,
}: ClientPageProps) {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<DriverFilters>({});
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { drivers, total, isError, isLoading, mutateDrivers } = useFetchDrivers(
    page,
    limit,
    filters,
    sortColumn,
    sortDirection,
    {
      drivers: initialDrivers,
      total: initialTotal,
    }
  );

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Driver | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Driver | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);

  const { showToast } = useToast();

  const [isDeleting, setIsDeleting] = useState(false);

  const isAtLimit = userPlan === "BASIC" && total >= 3;

  const { deleteMany: deleteManyDrivers } = useCrud<Driver>("/api/drivers");

  const handleOpenFormModal = (item: Driver | null = null) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleAddClick = () => {
    if (isAtLimit) {
      setIsUpgradeModalOpen(true);
    } else {
      handleOpenFormModal();
    }
  };

  const handleCloseFormModal = () => {
    setEditingItem(null);
    setIsFormModalOpen(false);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (formData: WithoutBaseItem<Driver>) => {
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `/api/drivers/${editingItem.id}` : "/api/drivers";
    const optimisticData = editingItem
      ? drivers.map((d) =>
          d.id === editingItem.id ? { ...d, ...formData } : d
        )
      : [
          {
            ...(formData as Driver),
            id: "temp-id",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: "temp-user-id", // This will be replaced by the server response
          },
          ...drivers,
        ];
    const options = {
      optimisticData: { drivers: optimisticData, total },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };
    setIsSaving(true);
    handleCloseFormModal();
    try {
      await mutateDrivers(async () => {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error);
        }
        const savedDriver = await response.json();
        showToast(
          `Motorista ${editingItem ? "atualizado" : "cadastrado"} com sucesso!`,
          "success"
        );
        // Replace temp-id with the real id
        const finalData = optimisticData.map((d) =>
          d.id === "temp-id" ? savedDriver : d
        );
        return { drivers: finalData, total: editingItem ? total : total + 1 };
      }, options);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Ocorreu um erro",
        "error"
      );
    }
    setIsSaving(false);
  };

  const handleDeleteClick = (item: Driver) => {
    setItemToDelete(item);
  };

  const handleCloseDeleteModal = () => {
    setItemToDelete(null);
    setItemsToDelete([]);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const optimisticData = drivers.filter((d) => d.id !== itemToDelete.id);
    const options = {
      optimisticData: { drivers: optimisticData, total: total - 1 },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };
    setIsDeleting(true);
    setItemToDelete(null);
    try {
      await mutateDrivers(async () => {
        const response = await fetch(`/api/drivers/${itemToDelete.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Falha ao excluir");
        }
        showToast("Motorista excluído com sucesso!", "success");
        return { drivers: optimisticData, total: total - 1 };
      }, options);
    } catch {
      showToast("Falha ao excluir motorista.", "error");
    }

    setIsDeleting(false);
  };

  const handleBulkDelete = (ids: string[]) => {
    setItemsToDelete(ids);
  };

  const handleConfirmBulkDelete = async () => {
    const optimisticData = drivers.filter(
      (driver) => !itemsToDelete.includes(driver.id)
    );
    const options = {
      optimisticData: {
        drivers: optimisticData,
        total: total - itemsToDelete.length,
      },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };
    setIsDeleting(true);
    setItemsToDelete([]);
    try {
      await mutateDrivers(async () => {
        await deleteManyDrivers(itemsToDelete);
        showToast("Motoristas excluídos com sucesso!", "success");
        return {
          drivers: optimisticData,
          total: total - itemsToDelete.length,
        };
      }, options);
    } catch {
      showToast("Falha ao excluir motoristas.", "error");
    }
    setIsDeleting(false);
  };

  const handleRowClick = (itemId: string) => {
    router.push(`/dashboard/drivers/${itemId}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleExport = async () => {
    try {
      showToast("Gerando CSV...", "success");
      const response = await fetch("/api/export/drivers");
      if (!response.ok) {
        throw new Error("Falha ao exportar motoristas.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `motoristas-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast("Motoristas exportados com sucesso!", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao exportar motoristas.",
        "error"
      );
    }
  };

  const totalPages = Math.ceil(total / limit);

  const addButton = (
    <button
      onClick={handleAddClick}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
    >
      <Plus size={20} />

      <span>Criar motorista</span>
    </button>
  );

  const handleSort = (column: string, direction: "asc" | "desc") => {
    setSortColumn(column);

    setSortDirection(direction);
  };

  const isFiltersEmpty = Object.keys(filters).length === 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Motoristas
        </h2>
        <div className="flex gap-2">
          {userPlan !== "BASIC" ? (
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-3 py-2 md:px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 w-full sm:w-auto"
            >
              <Download size={20} />
              <span className="hidden sm:inline whitespace-nowrap">
                Exportar CSV
              </span>
              <span className="sm:hidden">Exportar</span>
            </button>
          ) : (
            <UpgradePlaceholder
              featureName="Exportar Motoristas"
              onUpgradeClick={() => setIsUpgradeModalOpen(true)}
            >
              <button
                className="bg-green-600 text-white px-3 py-2 md:px-4 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto opacity-50 cursor-not-allowed"
                disabled
              >
                <Download size={20} />
                <span className="hidden sm:inline whitespace-nowrap">
                  Exportar CSV
                </span>
                <span className="sm:hidden">Exportar</span>
              </button>
            </UpgradePlaceholder>
          )}
          <button
            onClick={handleAddClick}
            className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 w-full sm:w-auto"
          >
            <Plus size={20} />
            <span className="hidden sm:inline whitespace-nowrap">
              Adicionar motorista
            </span>
            <span className="sm:hidden">Adicionar</span>
          </button>
        </div>
      </div>

      <AdvancedFilterBar
        filtersConfig={filtersConfig}
        onFilterChange={setFilters}
      />

      {isLoading && !drivers.length ? (
        <DriversSkeleton />
      ) : isError ? (
        <ErrorDisplay
          errorMessage="Falha ao carregar os motoristas."
          onRetry={mutateDrivers}
        />
      ) : total === 0 && isFiltersEmpty ? (
        <>
          <EmptyState
            Icon={User}
            title="Nenhum motorista cadastrado"
            description="Comece cadastrando o primeiro motorista da sua frota para poder gerenciá-los."
            actionButton={addButton}
          />
          <Modal
            isOpen={isFormModalOpen}
            onClose={handleCloseFormModal}
            title={editingItem ? "Editar motorista" : "Criar motorista"}
            size="4xl"
          >
            <DriverForm
              initialData={editingItem}
              isSaving={isSaving}
              onSave={handleSave}
              onCancel={handleCloseFormModal}
            />
          </Modal>
        </>
      ) : (
        <>
          <div className="hidden lg:block">
            <DataTable
              columns={columns}
              data={drivers || []}
              onRowClick={handleRowClick}
              onEdit={handleOpenFormModal}
              onDelete={handleDeleteClick}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onBulkDelete={handleBulkDelete}
            />{" "}
          </div>

          {/* ... [resto do código para mobile view, modais, etc. que permanece o mesmo] ... */}
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {(drivers || []).map((driver) => (
              <div
                key={driver.id}
                onClick={() => handleRowClick(driver.id)}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">{driver.name}</p>
                    <p className="text-sm text-gray-500">CPF: {driver.cpf}</p>
                    <p className="text-sm text-gray-500">Tel: {driver.phone}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      driver.status === "Ativo"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {driver.status}
                  </span>
                </div>
                <div
                  className="border-t pt-2 flex justify-end items-center"
                  onClick={handleActionClick}
                >
                  <div className="flex gap-2">
                    <button
                      title="Editar motorista"
                      onClick={() => handleOpenFormModal(driver)}
                      className="text-indigo-600 p-2 rounded-full hover:bg-gray-100"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      title="Excluir motorista"
                      onClick={() => handleDeleteClick(driver)}
                      className="text-red-600 p-2 rounded-full hover:bg-gray-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {drivers.length} de {total} motoristas.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-700">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || total === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingItem ? "Editar motorista" : "Criar motorista"}
        size="4xl"
      >
        <DriverForm
          initialData={editingItem}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={handleCloseFormModal}
        />
      </Modal>

      <DeleteConfirmationModal
        isOpen={!!itemToDelete || itemsToDelete.length > 0}
        onClose={handleCloseDeleteModal}
        onConfirm={itemToDelete ? handleConfirmDelete : handleConfirmBulkDelete}
        resourceName={
          itemToDelete ? "motorista" : `${itemsToDelete.length} motoristas`
        }
        resourceIdentifier={itemToDelete ? itemToDelete.name : "selecionados"}
        isDeleting={isDeleting}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        resourceName="motoristas"
        monthlyPrice="R$ 49,90"
        annualPrice="R$ 499"
        annualSavings="Economize R$ 99,80"
      />
    </div>
  );
}
