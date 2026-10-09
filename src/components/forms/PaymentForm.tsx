"use client";

import { Payment, Contract, Driver, Vehicle, WithoutBaseItem } from "@/types";
import { useState, useEffect, FormEvent } from "react";
import {
  DollarSign,
  HelpCircle,
  Calendar,
  List,
  CheckSquare,
} from "lucide-react";
import CurrencyInput from "../ui/CurrencyInput";
import Tooltip from "../ui/ToolTip";
import CustomSelect, { SelectOption } from "../ui/CustomSelect";

interface PaymentFormProps {
  initialData?: Payment | null;
  contracts: Contract[];
  drivers: Driver[];
  vehicles: Vehicle[];
  onSave: (data: WithoutBaseItem<Payment>) => void;
  onCancel: () => void;
  isContractLocked?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  initialData,
  contracts,
  drivers,
  vehicles,
  onSave,
  onCancel,
  isContractLocked = false,
}) => {
  const [formData, setFormData] = useState({
    contractId: "",
    weekStart: "",
    weekEnd: "",
    value: undefined as string | undefined,
    dueDate: "",
    paymentDate: "",
    status: "Pago" as "Pago" | "Pendente",
  });

  const statusOptions: SelectOption[] = [
    { value: "Pago", label: "Pago" },
    { value: "Pendente", label: "Pendente" },
  ];

  const contractOptions: SelectOption[] = contracts
    .filter((c) => c.status === "Ativo")
    .map((contract) => {
      const driver = drivers.find((d) => d.id === contract.driverId);
      const vehicle = vehicles.find((v) => v.id === contract.vehicleId);
      return {
        value: contract.id,
        label: `${driver?.name} - ${vehicle?.plate} (${vehicle?.model})`,
      };
    });

  useEffect(() => {
    if (initialData) {
      setFormData({
        contractId: initialData.contractId,
        weekStart: initialData.weekStart
          ? new Date(initialData.weekStart).toISOString().split("T")[0]
          : "",
        weekEnd: initialData.weekEnd
          ? new Date(initialData.weekEnd).toISOString().split("T")[0]
          : "",
        value: String(initialData.value),
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split("T")[0]
          : "",
        paymentDate: initialData.paymentDate
          ? new Date(initialData.paymentDate).toISOString().split("T")[0]
          : "",
        status: initialData.status as "Pago" | "Pendente",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "contractId") {
      const selectedContract = contracts.find((c) => c.id === value);
      if (selectedContract) {
        setFormData((prev) => ({
          ...prev,
          value: String(selectedContract.weeklyValue),
        }));
      }
    }
  };

  const handleCurrencyChange = (value: string | undefined, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parseCurrency = (value: string | undefined): number => {
      if (!value) return 0;
      const cleanedValue = value
        .replace(/R\$\s?/, "")
        .replace(/\./g, "")
        .replace(",", ".");
      return parseFloat(cleanedValue) || 0;
    };
    const dataToSave = {
      ...formData,
      value: parseCurrency(formData.value),
      weekStart: new Date(formData.weekStart).toISOString(),
      weekEnd: new Date(formData.weekEnd).toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
      paymentDate: formData.paymentDate
        ? new Date(formData.paymentDate).toISOString()
        : null,
    };
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="md:col-span-2">
          {isContractLocked && initialData ? (
            <div>
              <label className="mb-1 block text-sm font-semibold text-syncar-text">
                Contrato
              </label>
              <div className="relative">
                <List
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-syncar-text-muted"
                  size={18}
                />
                <input
                  type="text"
                  disabled
                  value={
                    contractOptions.find(
                      (c) => c.value === initialData.contractId
                    )?.label || ""
                  }
                  className="h-11 w-full cursor-not-allowed rounded-lg border border-syncar-border bg-syncar-surface-subtle py-2 pl-11 pr-4 text-sm text-syncar-text-muted"
                />
              </div>
            </div>
          ) : (
            <CustomSelect
              label="Contrato *"
              value={formData.contractId}
              onChange={(value) => {
                const event = {
                  target: { name: "contractId", value },
                } as React.ChangeEvent<HTMLSelectElement>;
                handleChange(event);
              }}
              options={contractOptions}
              placeholder="Selecione um contrato"
              Icon={List}
            />
          )}
        </div>

        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1">
            <label
              htmlFor="weekStart"
              className="block text-sm font-semibold text-syncar-text"
            >
              Início da semana *
            </label>
            <Tooltip text="O primeiro dia do período de 7 dias que este pagamento cobre.">
              <HelpCircle size={16} className="cursor-help text-syncar-text-muted" />
            </Tooltip>
          </div>
          <Calendar className="absolute left-3 top-9 text-syncar-text-muted" size={18} />
          <input
            id="weekStart"
            type="date"
            name="weekStart"
            value={formData.weekStart}
            onChange={handleChange}
            required
            className="h-11 w-full rounded-lg border border-syncar-border bg-syncar-surface py-2 pl-11 pr-4 text-sm text-syncar-text focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20"
          />
        </div>

        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1">
            <label
              htmlFor="weekEnd"
              className="block text-sm font-semibold text-syncar-text"
            >
              Fim da semana *
            </label>
            <Tooltip text="O último dia do período de 7 dias que este pagamento cobre.">
              <HelpCircle size={16} className="cursor-help text-syncar-text-muted" />
            </Tooltip>
          </div>
          <Calendar className="absolute left-3 top-9 text-syncar-text-muted" size={18} />
          <input
            id="weekEnd"
            type="date"
            name="weekEnd"
            value={formData.weekEnd}
            onChange={handleChange}
            required
            className="h-11 w-full rounded-lg border border-syncar-border bg-syncar-surface py-2 pl-11 pr-4 text-sm text-syncar-text focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20"
          />
        </div>

        <CurrencyInput
          label="Valor (R$) *"
          Icon={DollarSign}
          name="value"
          value={formData.value}
          onValueChange={(value) => handleCurrencyChange(value, "value")}
          required
        />
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1">
            <label
              htmlFor="dueDate"
              className="block text-sm font-semibold text-syncar-text"
            >
              Data de vencimento *
            </label>
            <Tooltip text="O prazo final para o pagamento. Usado no controle de inadimplência.">
              <HelpCircle size={16} className="cursor-help text-syncar-text-muted" />
            </Tooltip>
          </div>
          <Calendar className="absolute left-3 top-9 text-syncar-text-muted" size={18} />
          <input
            id="dueDate"
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
            className="h-11 w-full rounded-lg border border-syncar-border bg-syncar-surface py-2 pl-11 pr-4 text-sm text-syncar-text focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20"
          />
        </div>

        <div className="relative">
          <label htmlFor="paymentDate" className="mb-1 block text-sm font-semibold text-syncar-text">
            Data do pagamento
          </label>
          <Calendar className="absolute left-3 top-9 text-syncar-text-muted" size={18} />
          <input
            id="paymentDate"
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border border-syncar-border bg-syncar-surface py-2 pl-11 pr-4 text-sm text-syncar-text focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20"
          />
        </div>

        <CustomSelect
          label="Status *"
          value={formData.status}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              status: value as "Pago" | "Pendente",
            }))
          }
          options={statusOptions}
          Icon={CheckSquare}
        />
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-lg border border-syncar-border bg-syncar-surface px-5 py-2 text-sm font-semibold text-syncar-text transition-colors hover:bg-syncar-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-focus"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-syncar-brand px-5 py-2 text-sm font-semibold text-syncar-brand-contrast transition-colors hover:bg-syncar-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-focus"
        >
          Salvar
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
