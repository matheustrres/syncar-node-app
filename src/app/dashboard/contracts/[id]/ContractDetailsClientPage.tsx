"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Contract,
  ContractWithDetails,
  Driver,
  Vehicle,
  WithoutBaseItem,
} from "@/types";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import ContractForm from "@/components/forms/ContractForm";
import ContractDetailsSkeleton from "./ContractDetailsSkeleton";
import { useFetchContractById } from "@/hooks/useData";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";

const DetailItem = ({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}) => (
  <div className="py-2">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className={`text-md text-gray-900 ${className}`}>{value}</p>
  </div>
);

interface ClientPageProps {
  id: string;
  initialContract: ContractWithDetails;
  initialVehicles: Vehicle[];
  initialDrivers: Driver[];
}

export default function ContractDetailsClientPage({
  id,
  initialContract,
  initialDrivers,
  initialVehicles,
}: ClientPageProps) {
  const router = useRouter();

  const {
    data: contract,
    isError: isContractError,
    mutate: mutateContract,
  } = useFetchContractById(id, initialContract);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formApiError, setFormApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (data: WithoutBaseItem<Contract>) => {
    setIsSaving(true);
    setFormApiError(null);
    const response = await fetch(`/api/contracts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const { error } = await response.json();
      setFormApiError(error);
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
    setIsFormModalOpen(false);
    mutateContract();
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await fetch(`/api/contracts/${id}`, { method: "DELETE" });
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    router.push("/dashboard/contracts");
  };

  if (!contract && !isContractError) return <ContractDetailsSkeleton />;
  if (isContractError) {
    return (
      <ErrorDisplay
        errorMessage="Falha ao carregar o contrato."
        onRetry={mutateContract}
      />
    );
  }
  if (!contract) return <div>Contrato não encontrado.</div>;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
      >
        <ArrowLeft size={20} />
        Voltar para a lista de contratos
      </button>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {contract.driver.name}
            </h2>
            <p className="text-lg text-gray-600">
              {contract.vehicle.plate} - {contract.vehicle.brand}{" "}
              {contract.vehicle.model}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${contract.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
            >
              {contract.status}
            </span>
            <button
              onClick={() => setIsFormModalOpen(true)}
              title="Editar contrato"
              className="p-2 rounded-full hover:bg-gray-100 text-indigo-600"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              title="Excluir contrato"
              className="p-2 rounded-full hover:bg-gray-100 text-red-600"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="border-t mt-6 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Detalhes do contrato
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <DetailItem
              label="Valor semanal"
              value={`R$ ${contract.weeklyValue.toFixed(2)}`}
              className="font-semibold text-green-600"
            />
            <DetailItem label="Data do pagamento" value={contract.paymentDay} />
            <DetailItem
              label="Caução"
              value={`R$ ${contract.deposit.toFixed(2)}`}
            />
            <DetailItem
              label="Data de início"
              value={new Date(contract.startDate).toLocaleDateString("pt-BR")}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Editar contrato"
        size="4xl"
      >
        <ContractForm
          initialData={contract}
          vehicles={initialVehicles}
          drivers={initialDrivers}
          isSaving={isSaving}
          apiError={formApiError}
          onSave={handleSave}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        resourceName="contrato"
        resourceIdentifier={`do motorista ${contract.driver.name}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
