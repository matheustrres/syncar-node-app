"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Driver } from "@/types";
import Modal from "@/components/ui/Modal";
import DriverForm from "@/components/forms/DriverForm";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import DriversSkeleton from "./DriversSkeleton";

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/drivers");
      if (!res.ok) throw new Error("Falha ao buscar dados dos motoristas.");
      const data = await res.json();
      setDrivers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleOpenFormModal = (driver: Driver | null = null) => {
    setEditingDriver(driver);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setEditingDriver(null);
    setIsFormModalOpen(false);
  };

  const handleSave = async (
    data: Omit<Driver, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    const method = editingDriver ? "PUT" : "POST";
    const url = editingDriver
      ? `/api/drivers/${editingDriver.id}`
      : "/api/drivers";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    handleCloseFormModal();
    await fetchDrivers();
  };

  const handleDeleteClick = (driver: Driver) => {
    setDriverToDelete(driver);
  };

  const handleConfirmDelete = async () => {
    if (driverToDelete) {
      await fetch(`/api/drivers/${driverToDelete.id}`, { method: "DELETE" });
      setDriverToDelete(null);
      await fetchDrivers();
    }
  };

  const handleRowClick = (driverId: string) => {
    router.push(`/dashboard/drivers/${driverId}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (loading) return <DriversSkeleton />;

  return (
    <div>
      {/* CABEÇALHO ATUALIZADO */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Motoristas
        </h2>
        <button
          onClick={() => handleOpenFormModal()}
          className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          {/* O texto agora só aparece em telas pequenas (sm) ou maiores */}
          <span className="hidden sm:inline whitespace-nowrap">
            Adicionar Motorista
          </span>
        </button>
      </div>

      {/* Layout de Tabela para Telas Grandes (lg e acima) */}
      <div className="hidden lg:block bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                CPF
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Telefone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drivers.map((driver) => (
              <tr
                key={driver.id}
                onClick={() => handleRowClick(driver.id)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {driver.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{driver.cpf}</td>
                <td className="px-6 py-4 whitespace-nowrap">{driver.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${driver.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {driver.status}
                  </span>
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                  onClick={handleActionClick}
                >
                  <button
                    title="Editar Motorista"
                    onClick={() => handleOpenFormModal(driver)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    title="Excluir Motorista"
                    onClick={() => handleDeleteClick(driver)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Layout de Cartões para Telas Pequenas (abaixo de lg) - ESTRUTURA MELHORADA */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {drivers.map((driver) => (
          <div
            key={driver.id}
            onClick={() => handleRowClick(driver.id)}
            className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between"
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
                  title="Editar Motorista"
                  onClick={() => handleOpenFormModal(driver)}
                  className="text-indigo-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <Edit size={18} />
                </button>
                <button
                  title="Excluir Motorista"
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
        title={editingDriver ? "Editar Motorista" : "Adicionar Motorista"}
        size="4xl"
      >
        <DriverForm
          initialData={editingDriver}
          onSave={handleSave}
          onCancel={handleCloseFormModal}
        />
      </Modal>

      <Modal
        isOpen={!!driverToDelete}
        onClose={() => setDriverToDelete(null)}
        title="Confirmar Exclusão"
        size="md"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-3">
            Excluir Motorista
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Você tem certeza que deseja excluir o motorista{" "}
              <span className="font-bold">{driverToDelete?.name}</span>? Esta
              ação não pode ser desfeita.
            </p>
          </div>
          <div className="items-center px-4 py-3 gap-4 flex justify-center">
            <button
              onClick={() => setDriverToDelete(null)}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Sim, Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
