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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <CustomSelect
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
          label="Valor semanal (R$) *"
          Icon={DollarSign}
          name="weeklyValue"
          value={formData.weeklyValue}
          onValueChange={(value) => handleCurrencyChange(value, "weeklyValue")}
          required
        />

        <CustomSelect
          label="Dia do pagamento *"
          value={formData.paymentDay}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, paymentDay: value }))
          }
          options={paymentDayOptions}
          Icon={Calendar}
        />

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de início *
          </label>
          <Calendar className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-100"
          />
        </div>

        <CurrencyInput
          label="Caução (R$) *"
          Icon={Shield}
          name="deposit"
          value={formData.deposit}
          onValueChange={(value) => handleCurrencyChange(value, "deposit")}
          required
        />

        <div className="md:col-span-1">
          <CustomSelect
            label="Status do contrato *"
            value={formData.status}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
            options={statusOptions}
            Icon={Hash}
          />
        </div>

        <div className="relative md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duração (semanas) *
          </label>
          <Hash className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="number"
            name="duration"
            value={formData.duration || ""}
            onChange={handleChange}
            required
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-100"
          />
        </div>
      </div>
      {apiError && (
        <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
          <AlertCircle size={16} />
          <span>{apiError}</span>
        </div>
      )}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
};

export default ContractForm;
