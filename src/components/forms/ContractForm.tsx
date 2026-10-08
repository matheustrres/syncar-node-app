"use client";

import { Contract, Vehicle, Driver } from "@/types";
import { useState, useEffect, FormEvent } from "react";
import {
  Car,
  User,
  DollarSign,
  Calendar,
  Shield,
  Hash,
  CircleCheck,
  AlertCircle,
} from "lucide-react";
import CurrencyInput from "../ui/CurrencyInput";
import CustomSelect, { SelectOption } from "../ui/CustomSelect";

interface ContractFormProps {
  initialData?: Contract | null;
  vehicles: Vehicle[];
  drivers: Driver[];
  isSaving?: boolean;
  apiError?: string | null;
  onSave: (
    data: Omit<Contract, "id" | "userId" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
}

const ContractForm: React.FC<ContractFormProps> = ({
  initialData,
  vehicles,
  drivers,
  isSaving,
  apiError,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    vehicleId: "",
    driverId: "",
    weeklyValue: undefined as string | undefined,
    paymentDay: "Segunda-feira",
    startDate: new Date().toISOString().split("T")[0],
    deposit: undefined as string | undefined,
    status: "Ativo",
    duration: undefined as number | undefined,
  });

  const availableVehiclesOptions: SelectOption[] = vehicles
    .filter((v) => v.status === "Disponível" || v.id === formData.vehicleId)
    .map((v) => ({ value: v.id, label: `${v.plate} - ${v.model}` }));

  const activeDriversOptions: SelectOption[] = drivers.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const paymentDayOptions: SelectOption[] = [
    { value: "Segunda-feira", label: "Segunda-feira" },
    { value: "Terça-feira", label: "Terça-feira" },
    { value: "Quarta-feira", label: "Quarta-feira" },
    { value: "Quinta-feira", label: "Quinta-feira" },
    { value: "Sexta-feira", label: "Sexta-feira" },
    { value: "Sábado", label: "Sábado" },
    { value: "Domingo", label: "Domingo" },
  ];

  const statusOptions: SelectOption[] = [
    { value: "Ativo", label: "Ativo" },
    { value: "Encerrado", label: "Encerrado" },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        vehicleId: initialData.vehicleId || "",
        driverId: initialData.driverId || "",
        weeklyValue: String(initialData.weeklyValue) || undefined,
        paymentDay: initialData.paymentDay || "Segunda-feira",
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        deposit: String(initialData.deposit) || undefined,
        status: initialData.status || "Ativo",
        duration: initialData.duration || undefined,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    const [year, month, day] = formData.startDate.split("-").map(Number);
    onSave({
      ...formData,
      weeklyValue: parseCurrency(formData.weeklyValue),
      deposit: parseCurrency(formData.deposit),
      startDate: new Date(year, month - 1, day).toISOString(),
      duration: formData.duration
        ? parseInt(String(formData.duration), 10)
        : null,
    });
  };

  const labelStyle = "mb-1.5 block text-sm font-semibold text-syncar-text";
  const inputStyle =
    "min-h-11 w-full rounded-syncar-control border border-syncar-border bg-syncar-surface py-2.5 pl-11 pr-4 text-sm text-syncar-text placeholder:text-syncar-text-muted focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <CustomSelect
          variant="platform"
          id="vehicleId"
          name="vehicleId"
          label="Veículo *"
          value={formData.vehicleId}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, vehicleId: value }))
          }
          options={availableVehiclesOptions}
          placeholder="Selecione um veículo disponível"
          Icon={Car}
        />

        <CustomSelect
          variant="platform"
          id="driverId"
          name="driverId"
          label="Motorista *"
          value={formData.driverId}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, driverId: value }))
          }
          options={activeDriversOptions}
          placeholder="Selecione um motorista ativo"
          Icon={User}
        />

        <CurrencyInput
          variant="platform"
          label="Valor semanal (R$) *"
          Icon={DollarSign}
          name="weeklyValue"
          value={formData.weeklyValue}
          onValueChange={(value) => handleCurrencyChange(value, "weeklyValue")}
          required
        />

        <CustomSelect
          variant="platform"
          id="paymentDay"
          name="paymentDay"
          label="Dia do pagamento *"
          value={formData.paymentDay}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, paymentDay: value }))
          }
          options={paymentDayOptions}
          Icon={Calendar}
        />

        <div className="relative">
          <label htmlFor="startDate" className={labelStyle}>
            Data de início *
          </label>
          <Calendar
            className="pointer-events-none absolute left-3 top-9 text-syncar-text-muted [stroke-width:1.75]"
            size={18}
            aria-hidden="true"
          />
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className={inputStyle}
          />
        </div>

        <CurrencyInput
          variant="platform"
          label="Caução (R$) *"
          Icon={Shield}
          name="deposit"
          value={formData.deposit}
          onValueChange={(value) => handleCurrencyChange(value, "deposit")}
          required
        />

        <div className="md:col-span-1">
          <CustomSelect
            variant="platform"
            id="status"
            name="status"
            label="Status do contrato *"
            value={formData.status}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
            options={statusOptions}
            Icon={CircleCheck}
          />
        </div>

        <div className="relative md:col-span-1">
          <label htmlFor="duration" className={labelStyle}>
            Duração (semanas) *
          </label>
          <Hash
            className="pointer-events-none absolute left-3 top-9 text-syncar-text-muted [stroke-width:1.75]"
            size={18}
            aria-hidden="true"
          />
          <input
            type="number"
            id="duration"
            name="duration"
            min="1"
            value={formData.duration || ""}
            onChange={handleChange}
            required
            className={inputStyle}
          />
        </div>
      </div>
      {apiError && (
        <div
          role="alert"
          className="mt-1 flex items-center gap-1 text-sm text-syncar-danger"
        >
          <AlertCircle size={16} aria-hidden="true" />
          <span>{apiError}</span>
        </div>
      )}
      <div className="flex flex-wrap justify-end gap-3 border-t border-syncar-border pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="min-h-11 rounded-syncar-control border border-syncar-border bg-syncar-surface px-5 text-sm font-semibold text-syncar-text hover:bg-syncar-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-focus disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="min-h-11 rounded-syncar-control bg-syncar-action px-6 text-sm font-bold text-syncar-action-text hover:bg-syncar-action-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-focus disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
};

export default ContractForm;
