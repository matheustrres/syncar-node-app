"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Contract, Vehicle, Driver } from "@/types";
import Modal from "@/components/ui/Modal";
import ContractForm from "@/components/forms/ContractForm";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import ContractsSkeleton from "./ContractsSkeleton";

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(
    null
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contractsRes, vehiclesRes, driversRes] = await Promise.all([
        fetch("/api/contracts"),
        fetch("/api/vehicles"),
        fetch("/api/drivers"),
      ]);
      setContracts(await contractsRes.json());
      setVehicles(await vehiclesRes.json());
      setDrivers(await driversRes.json());
    } catch (error) {
      console.error("Falha ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenFormModal = (contract: Contract | null = null) => {
    setEditingContract(contract);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setEditingContract(null);
    setIsFormModalOpen(false);
  };

  const handleSave = async (
    data: Omit<Contract, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    const method = editingContract ? "PUT" : "POST";
    const url = editingContract
      ? `/api/contracts/${editingContract.id}`
      : "/api/contracts";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    handleCloseFormModal();
    await fetchData();
  };

  const handleDeleteClick = (contract: Contract) => {
    setContractToDelete(contract);
  };

  const handleConfirmDelete = async () => {
    if (contractToDelete) {
      await fetch(`/api/contracts/${contractToDelete.id}`, {
        method: "DELETE",
      });
      setContractToDelete(null);
      await fetchData();
    }
  };

  const handleRowClick = (contractId: string) => {
    router.push(`/dashboard/contracts/${contractId}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (loading) return <ContractsSkeleton />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Contratos
        </h2>
        <button
          onClick={() => handleOpenFormModal()}
          className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span className="hidden sm:inline whitespace-nowrap">
            Novo contrato
          </span>
        </button>
      </div>

      {/* Layout de Tabela para Telas Grandes */}
      <div className="hidden lg:block bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Motorista
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Veículo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Valor semanal
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
            {contracts.map((contract) => {
              const driver = drivers.find((d) => d.id === contract.driverId);
              const vehicle = vehicles.find((v) => v.id === contract.vehicleId);
              return (
                <tr
                  key={contract.id}
                  onClick={() => handleRowClick(contract.id)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {driver?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vehicle ? `${vehicle.plate} - ${vehicle.model}` : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                    R$ {contract.weeklyValue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contract.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {contract.status}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                    onClick={handleActionClick}
                  >
                    <button
                      title="Editar contrato"
                      onClick={() => handleOpenFormModal(contract)}
                      className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-gray-100"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      title="Excluir contrato"
                      onClick={() => handleDeleteClick(contract)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-gray-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Layout de Cartões para Telas Pequenas */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {contracts.map((contract) => {
          const driver = drivers.find((d) => d.id === contract.driverId);
          const vehicle = vehicles.find((v) => v.id === contract.vehicleId);
          return (
            <div
              key={contract.id}
              onClick={() => handleRowClick(contract.id)}
              className="bg-white rounded-lg shadow-md p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900">{driver?.name}</p>
                  <p className="text-sm text-gray-500">
                    {vehicle?.plate} - {vehicle?.model}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${contract.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                >
                  {contract.status}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <p className="font-semibold text-green-600">
                  R$ {contract.weeklyValue.toFixed(2)}
                  <span className="font-normal text-sm text-gray-500">
                    /semana
                  </span>
                </p>
                <div className="flex gap-2" onClick={handleActionClick}>
                  <button
                    title="Editar Contrato"
                    onClick={() => handleOpenFormModal(contract)}
                    className="text-indigo-600 p-2 rounded-full hover:bg-gray-100"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    title="Excluir Contrato"
                    onClick={() => handleDeleteClick(contract)}
                    className="text-red-600 p-2 rounded-full hover:bg-gray-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingContract ? "Editar contrato" : "Novo contrato"}
        size="4xl"
      >
        <ContractForm
          initialData={editingContract}
          vehicles={vehicles}
          drivers={drivers}
          onSave={handleSave}
          onCancel={handleCloseFormModal}
        />
      </Modal>

      <Modal
        isOpen={!!contractToDelete}
        onClose={() => setContractToDelete(null)}
        title="Confirmar exclusão"
        size="md"
      >
        <div className="text-center p-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="text-lg font-medium text-gray-900 mt-2">
            Excluir contrato
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Tem certeza que quer excluir o contrato do motorista{" "}
            <span className="font-bold">
              {drivers.find((d) => d.id === contractToDelete?.driverId)?.name}
            </span>
            ?
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setContractToDelete(null)}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
