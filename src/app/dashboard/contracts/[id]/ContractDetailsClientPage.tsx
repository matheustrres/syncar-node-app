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
import { useToast } from "@/context/ToastContext";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import ContractForm from "@/components/forms/ContractForm";
import ContractDetailsSkeleton from "./ContractDetailsSkeleton";
import { useFetchContractById } from "@/hooks/useData";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import styles from "../../detailPages.module.css";

const DetailItem = ({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}) => (
  <div className={styles.detailItem}>
    <p className={styles.detailLabel}>{label}</p>
    <p className={`${styles.detailValue} ${className}`}>{value}</p>
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
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (data: WithoutBaseItem<Contract>) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/contracts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
      showToast("Contrato atualizado com sucesso!", "success");
      setIsFormModalOpen(false);
      mutateContract();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Ocorreu um erro",
        "error"
      );
    }
    setIsSaving(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await fetch(`/api/contracts/${id}`, { method: "DELETE" });
      showToast("Contrato excluído com sucesso!", "success");
      setIsDeleteModalOpen(false);
      router.push("/dashboard/contracts");
    } catch {
      showToast("Falha ao excluir contrato.", "error");
    }
    setIsDeleting(false);
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
    <div className={styles.page}>
      <button
        onClick={() => router.back()}
        className={styles.backLink}
      >
        <ArrowLeft size={20} />
        Voltar para a lista de contratos
      </button>

      <section className={styles.panel}>
        <header className={styles.detailHeader}>
          <div className={styles.identity}>
            <h1 className={styles.title}>
              {contract.driver.name}
            </h1>
            <p className={styles.subtitle}>
              {contract.vehicle.plate} - {contract.vehicle.brand}{" "}
              {contract.vehicle.model}
            </p>
          </div>
          <div className={styles.headerActions}>
            <span className={`${styles.status} ${contract.status === "Ativo" ? styles.success : styles.neutral}`}>
              {contract.status}
            </span>
            <button
              onClick={() => setIsFormModalOpen(true)}
              title="Editar contrato"
              className={styles.iconButton}
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              title="Excluir contrato"
              className={`${styles.iconButton} ${styles.deleteButton}`}
            >
              <Trash2 size={20} />
            </button>
          </div>
        </header>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Detalhes do contrato
          </h2>
          <div className={styles.detailGrid}>
            <DetailItem label="Motorista" value={contract.driver.name} />
            <DetailItem
              label="Valor semanal"
              value={`R$ ${contract.weeklyValue.toFixed(2)}`}
              className={styles.success}
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
            {contract.duration && (
              <DetailItem
                label="Duração (semanas)"
                value={contract.duration}
              />
            )}
          </div>
        </div>
      </section>

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
