"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Driver, WithoutBaseItem } from "@/types";
import { useFetchDrivers } from "@/hooks/useData";
import Modal from "@/components/ui/Modal";
import DriverForm from "@/components/forms/DriverForm";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import DriversSkeleton from "./DriversSkeleton";
import UpgradeModal from "@/components/ui/UpgradeModal";
import FilterBar from "@/components/ui/FilterBar";

const columns: Column<Driver>[] = [
  { header: "Nome", accessor: "name", className: "font-medium text-gray-900" },
  { header: "CPF", accessor: "cpf" },
  { header: "Telefone", accessor: "phone" },
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

export default function DriversClientPage({
  initialDrivers,
  total: initialTotal,
  userPlan,
}: ClientPageProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const { drivers, total, isError, isLoading, mutateDrivers } = useFetchDrivers(
    page,
    limit,
    searchTerm,
    statusFilter,
    {
      drivers: initialDrivers,
      total: initialTotal,
    }
  );

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Driver | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Driver | null>(null);

  const isAtLimit = userPlan === "BASIC" && total >= 3;

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

  const handleSave = async (formData: WithoutBaseItem<Driver>) => {
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `/api/drivers/${editingItem.id}` : "/api/drivers";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const { error } = await response.json();
      alert(error);
      return;
    }

    handleCloseFormModal();
    mutateDrivers();
  };

  const handleDeleteClick = (item: Driver) => {
    setItemToDelete(item);
  };

  const handleCloseDeleteModal = () => {
    setItemToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await fetch(`/api/drivers/${itemToDelete.id}`, { method: "DELETE" });
      setItemToDelete(null);
      mutateDrivers();
    }
  };

  const handleRowClick = (itemId: string) => {
    router.push(`/dashboard/drivers/${itemId}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (isLoading && !drivers.length) return <DriversSkeleton />;

  if (isError) {
    return (
      <div className="text-center text-red-500 mt-10">
        Falha ao carregar os motoristas.
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Motoristas
        </h2>
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

      <FilterBar 
        searchPlaceholder="Buscar por nome..."
        filterOptions={statusOptions}
        onSearchChange={setSearchTerm}
        onFilterChange={setStatusFilter}
      />

      <div className="hidden lg:block">
        <DataTable
          columns={columns}
          data={drivers || []}
          onRowClick={handleRowClick}
          onEdit={handleOpenFormModal}
          onDelete={handleDeleteClick}
        />
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

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingItem ? "Editar Motorista" : "Adicionar Motorista"}
        size="4xl"
      >
        <DriverForm
          initialData={editingItem}
          onSave={handleSave}
          onCancel={handleCloseFormModal}
        />
      </Modal>

      <Modal
        isOpen={!!itemToDelete}
        onClose={handleCloseDeleteModal}
        title="Confirmar Exclusão"
        size="md"
      >
        <div className="text-center p-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-3">
            Excluir Motorista
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Você tem certeza que deseja excluir o motorista{" "}
              <span className="font-bold">{itemToDelete?.name}</span>? Esta ação
              não poderá ser desfeita.
            </p>
          </div>
          <div className="items-center px-4 py-3 gap-4 flex justify-center">
            <button
              onClick={handleCloseDeleteModal}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>

      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        resourceName="motoristas"
      />
    </div>
  );
}
