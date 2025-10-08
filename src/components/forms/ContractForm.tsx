"use client";

import { Contract, Vehicle, Driver } from "@/types";
import { useState, useEffect, FormEvent } from "react";
import { Car, User, Calendar, Shield, Hash, DollarSign } from "lucide-react";
import CurrencyInput from "../ui/CurrencyInput";

interface ContractFormProps {
  initialData?: Contract | null;
  vehicles: Vehicle[];
  drivers: Driver[];
  onSave: (
    data: Omit<Contract, "id" | "userId" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
}

const ContractForm: React.FC<ContractFormProps> = ({
  initialData,
  vehicles,
  drivers,
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
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        vehicleId: initialData.vehicleId,
        driverId: initialData.driverId,
        weeklyValue: String(initialData.weeklyValue),
        paymentDay: initialData.paymentDay,
        startDate: initialData.startDate.split("T")[0],
        deposit: String(initialData.deposit),
        status: initialData.status,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      // Remove o símbolo 'R$' e os pontos de milhar, depois troca a vírgula por ponto
      const cleanedValue = value
        .replace(/R\$\s?/, "")
        .replace(/\./g, "")
        .replace(",", ".");
      return parseFloat(cleanedValue) || 0;
    };

    onSave({
      ...formData,
      weeklyValue: parseCurrency(formData.weeklyValue),
      deposit: parseCurrency(formData.deposit),
      startDate: new Date(formData.startDate).toISOString(),
    });
  };

  const availableVehicles = vehicles.filter(
    (v) => v.status === "Disponível" || v.id === formData.vehicleId
  );
  const activeDrivers = drivers.filter(
    (d) => d.status === "Ativo" || d.id === formData.driverId
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Veículo *
          </label>
          <Car className="absolute left-3 top-9 text-gray-400" size={20} />
          <select
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            required
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um veículo disponível</option>
            {availableVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate} - {v.model}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motorista *
          </label>
          <User className="absolute left-3 top-9 text-gray-400" size={20} />
          <select
            name="driverId"
            value={formData.driverId}
            onChange={handleChange}
            required
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um motorista ativo</option>
            {activeDrivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <CurrencyInput
          label="Valor semanal (R$) *"
          Icon={DollarSign}
          name="weeklyValue"
          value={formData.weeklyValue}
          onValueChange={(value) => handleCurrencyChange(value, "weeklyValue")}
          required
        />

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dia do pagamento *
          </label>
          <Calendar className="absolute left-3 top-9 text-gray-400" size={20} />
          <select
            name="paymentDay"
            value={formData.paymentDay}
            onChange={handleChange}
            required
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Segunda-feira">Segunda-feira</option>
            <option value="Terça-feira">Terça-feira</option>
            <option value="Quarta-feira">Quarta-feira</option>
            <option value="Quinta-feira">Quinta-feira</option>
            <option value="Sexta-feira">Sexta-feira</option>
            <option value="Sábado">Sábado</option>
            <option value="Domingo">Domingo</option>
          </select>
        </div>

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
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

        <div className="md:col-span-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status do contrato *
          </label>
          <Hash className="absolute left-3 top-9 text-gray-400" size={20} />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Ativo">Ativo</option>
            <option value="Encerrado">Encerrado</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Salvar
        </button>
      </div>
    </form>
  );
};

export default ContractForm;
