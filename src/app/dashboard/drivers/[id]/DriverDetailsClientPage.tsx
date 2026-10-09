"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { Driver, Payment, WithoutBaseItem } from "@/types";
import {
  useFetchDriverById,
  useFetchDriverPayments,
  useAllVehicles,
  useAllDrivers,
  useAllContracts,
} from "@/hooks/useData";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import DriverForm from "@/components/forms/DriverForm";
import DriverDetailsSkeleton from "./DriverDetailsSkeleton";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import DataTable, { Column } from "@/components/ui/DataTable";
import { PaymentWithRelations } from "@/hooks/useData";
import DataTableSkeleton from "@/components/ui/DataTableSkeleton";
import PaymentForm from "@/components/forms/PaymentForm";
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
  initialDriver: Driver;
}

export default function DriverDetailsClientPage({
  id,
  initialDriver,
}: ClientPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    data: driver,
    isError,
    mutate: mutateDriver,
  } = useFetchDriverById(id, initialDriver);
  const {
    payments,
    isLoading: isLoadingPayments,
    mutate: mutatePayments,
  } = useFetchDriverPayments(id);
  const { vehicles } = useAllVehicles();
  const { drivers } = useAllDrivers();
  const { contracts } = useAllContracts();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isPaymentFormModalOpen, setIsPaymentFormModalOpen] = useState(false);
  const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] =
    useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [, setIsSavingPayment] = useState(false);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const handleOpenEditPaymentModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentFormModalOpen(true);
  };

  const handleOpenDeletePaymentModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDeletePaymentModalOpen(true);
  };

  const handleSavePayment = async (paymentData: WithoutBaseItem<Payment>) => {
    if (!selectedPayment) return;
    setIsSavingPayment(true);
    try {
      const response = await fetch(`/api/payments/${selectedPayment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
      showToast("Pagamento atualizado com sucesso!", "success");
      setIsPaymentFormModalOpen(false);
      mutatePayments();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Ocorreu um erro",
        "error"
      );
    }
    setIsSavingPayment(false);
  };

  const handleConfirmDeletePayment = async () => {
    if (!selectedPayment) return;
    setIsDeletingPayment(true);
    try {
      await fetch(`/api/payments/${selectedPayment.id}`, { method: "DELETE" });
      showToast("Pagamento excluído com sucesso!", "success");
      setIsDeletePaymentModalOpen(false);
      mutatePayments();
    } catch {
      showToast("Falha ao excluir pagamento.", "error");
    }
    setIsDeletingPayment(false);
  };

  const paymentColumns: Column<PaymentWithRelations>[] = [
    {
      header: "Veículo",
      accessor: (item) =>
        `${item.contract.vehicle.plate} (${item.contract.vehicle.model})`,
    },
    {
      header: "Semana",
      accessor: (item) =>
        `${new Date(item.weekStart).toLocaleDateString(
          "pt-BR"
        )} - ${new Date(item.weekEnd).toLocaleDateString("pt-BR")}`,
    },
    {
      header: "Vencimento",
      accessor: (item) => new Date(item.dueDate).toLocaleDateString("pt-BR"),
    },
    {
      header: "Valor",
      accessor: (item) =>
        item.value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
    },
    {
      header: "Status",
      accessor: (item) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            item.status === "Pago"
              ? styles.success
              : item.status === "Pendente"
                ? styles.warning
                : styles.danger
          }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  const handleSave = async (data: WithoutBaseItem<Driver>) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/drivers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
      showToast("Motorista atualizado com sucesso!", "success");
      setIsFormModalOpen(false);
      mutateDriver();
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
      await fetch(`/api/drivers/${id}`, { method: "DELETE" });
      showToast("Motorista excluído com sucesso!", "success");
      setIsDeleteModalOpen(false);
      router.push("/dashboard/drivers");
    } catch {
      showToast("Falha ao excluir motorista.", "error");
    }
    setIsDeleting(false);
  };

  if (isError) {
    return (
      <ErrorDisplay
        errorMessage="Falha ao carregar dados do motorista."
        onRetry={mutateDriver}
      />
    );
  }

  if (!driver && !isError) return <DriverDetailsSkeleton />;
  if (!driver) return <div>Motorista não encontrado.</div>;

  const fullAddress = [
    driver.logradouro,
    driver.numero,
    driver.complemento,
    driver.bairro,
    driver.cidade,
    driver.uf,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={styles.page}>
      <button
        onClick={() => router.back()}
        className={styles.backLink}
      >
        <ArrowLeft size={20} />
        Voltar para a lista de motoristas
      </button>

      <section className={styles.panel}>
        <header className={styles.detailHeader}>
          <div className={styles.identity}>
            <h1 className={styles.title}>
              {driver.name}
            </h1>
            <p className={styles.subtitle}>CPF: {driver.cpf}</p>
          </div>
          <div className={styles.headerActions}>
            <span className={`${styles.status} ${driver.status === "Ativo" ? styles.success : styles.danger}`}>
              {driver.status}
            </span>
            <button
              onClick={() => setIsFormModalOpen(true)}
              title="Editar Motorista"
              className={styles.iconButton}
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              title="Excluir motorista"
              className={`${styles.iconButton} ${styles.deleteButton}`}
            >
              <Trash2 size={20} />
            </button>
          </div>
        </header>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Detalhes do motorista
          </h2>
          <div className={styles.detailGrid}>
            <DetailItem label="Nome completo" value={driver.name} />
            <DetailItem label="CPF" value={driver.cpf} />
            <DetailItem label="Telefone" value={driver.phone} />
            <DetailItem label="Email" value={driver.email} />
            <DetailItem label="CNH" value={driver.cnh || "Não informada"} />
            <DetailItem
              label="Validade da CNH"
              value={driver.cnhValidity
                ? new Date(driver.cnhValidity).toLocaleDateString("pt-BR")
                : "Não informada"}
            />
            {fullAddress && (
              <div className="md:col-span-2 lg:col-span-3">
                <DetailItem label="Endereço" value={fullAddress} />
              </div>
            )}
          </div>
        </div>
      </section>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Editar Motorista"
        size="4xl"
      >
        <DriverForm
          initialData={driver}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        resourceName="motorista"
        resourceIdentifier={driver.name}
        isDeleting={isDeleting}
      />

      {selectedPayment && (
        <>
          <Modal
            isOpen={isPaymentFormModalOpen}
            onClose={() => setIsPaymentFormModalOpen(false)}
            title="Editar pagamento"
            size="4xl"
          >
            <PaymentForm
              initialData={selectedPayment}
              vehicles={vehicles}
              drivers={drivers}
              contracts={contracts}
              onSave={handleSavePayment}
              onCancel={() => setIsPaymentFormModalOpen(false)}
              isContractLocked={true}
            />
          </Modal>
          <DeleteConfirmationModal
            isOpen={isDeletePaymentModalOpen}
            onClose={() => setIsDeletePaymentModalOpen(false)}
            onConfirm={handleConfirmDeletePayment}
            resourceName="pagamento"
            resourceIdentifier={`Valor: ${selectedPayment.value}`}
            isDeleting={isDeletingPayment}
          />
        </>
      )}

      <section className={styles.history}>
        <h2 className={styles.sectionTitle}>
          Histórico de pagamentos
        </h2>
        {session?.user?.plan === "BASIC" ? (
          <>
            <UpgradePlaceholder
              featureName="Histórico de pagamentos"
              onUpgradeClick={() => setIsUpgradeModalOpen(true)}
            >
              <DataTableSkeleton columns={5} />
            </UpgradePlaceholder>
            <UpgradeModal
              isOpen={isUpgradeModalOpen}
              onClose={() => setIsUpgradeModalOpen(false)}
              resourceName="Histórico de pagamentos"
              monthlyPrice="R$ 49,90"
              annualPrice="R$ 499"
              annualSavings="Economize R$ 99,80"
            />
          </>
        ) : isLoadingPayments ? (
          <DataTableSkeleton columns={5} />
        ) : payments.length > 0 ? (
          <DataTable
            columns={paymentColumns}
            data={payments}
            onRowClick={() => {}}
            onEdit={handleOpenEditPaymentModal}
            onDelete={handleOpenDeletePaymentModal}
            sortColumn="dueDate"
            sortDirection="desc"
            onSort={() => {}}
          />
        ) : (
          <div className={styles.empty}>
            Nenhum pagamento registrado para este motorista.
          </div>
        )}
      </section>
    </div>
  );
}
