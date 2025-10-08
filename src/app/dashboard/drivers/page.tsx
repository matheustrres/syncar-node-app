"use client";

import { Driver } from "@/types";
import Modal from "@/components/ui/Modal";
import DriverForm from "@/components/forms/DriverForm";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import DriversSkeleton from "./DriversSkeleton";
import { useCrud } from "@/hooks/useCrud";
import DataTable, { Column } from "@/components/ui/DataTable";

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

export default function DriversPage() {
  const {
    data: drivers,
    error,
    isFormModalOpen,
    editingItem,
    itemToDelete,
    handleOpenFormModal,
    handleCloseFormModal,
    handleSave,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleRowClick,
  } = useCrud<Driver>("/api/drivers");

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!drivers && !error) return <DriversSkeleton />;

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        Falha ao carregar os motoristas.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Motoristas
        </h2>
        <button
          onClick={() => handleOpenFormModal()}
          className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span className="hidden sm:inline whitespace-nowrap">
            Adicionar motorista
          </span>
          <span className="sm:hidden">Adicionar</span>
        </button>
      </div>

      {/* Layout de Tabela para Telas Grandes */}
      <div className="hidden lg:block">
        <DataTable
          columns={columns}
          data={drivers || []}
          onRowClick={handleRowClick}
          onEdit={handleOpenFormModal}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* Layout de Cartões para Telas Pequenas */}
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
                className={`px-2 py-1 text-xs font-semibold rounded-full ${driver.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
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

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingItem ? "Editar motorista" : "Adicionar motorista"}
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
        title="Confirmar exclusão"
        size="md"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-3">
            Excluir motorista
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
    </div>
  );
}
