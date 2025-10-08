"use client";

import { Vehicle } from "@/types";
import { useState, useEffect, FormEvent, FocusEvent } from "react";
import {
  CheckSquare,
  Hash,
  Palette,
  Gauge,
  Shield,
  Milestone,
  Calendar,
  Car,
} from "lucide-react";
import CustomSelect, { SelectOption } from "../ui/CustomSelect";

interface VehicleFormProps {
  initialData?: Vehicle | null;
  onSave: (
    data: Omit<Vehicle, "id" | "userId" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    plate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear() as number | string,
    color: "",
    renavam: "",
    chassis: "",
    km: 0 as number | string,
    status: "Disponível",
  });

  const statusOptions: SelectOption[] = [
    { value: "Disponível", label: "Disponível" },
    { value: "Alugado", label: "Alugado" },
    { value: "Manutenção", label: "Manutenção" },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        plate: initialData.plate,
        brand: initialData.brand,
        model: initialData.model,
        year: initialData.year,
        color: initialData.color,
        renavam: initialData.renavam,
        chassis: initialData.chassis,
        km: initialData.km,
        status: initialData.status,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleNumberFieldBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === "") {
      const defaultValue = name === "year" ? new Date().getFullYear() : 0;
      setFormData((prev) => ({ ...prev, [name]: defaultValue }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      year: parseInt(String(formData.year)) || new Date().getFullYear(),
      km: parseInt(String(formData.km)) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placa *
          </label>
          <Hash className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="text"
            name="plate"
            value={formData.plate}
            onChange={handleChange}
            required
            placeholder="ABC-1234"
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marca *
          </label>
          <Car className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            placeholder="Ex: Toyota"
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modelo *
          </label>
          <Car className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            placeholder="Ex: Corolla"
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ano *
          </label>
          <Calendar className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleNumberFieldBlur}
            required
            placeholder="2025"
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cor *
          </label>
          <Palette className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            required
            placeholder="Ex: Branco"
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quilometragem (km) *
          </label>
          <Gauge className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="number"
            name="km"
            value={formData.km}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleNumberFieldBlur}
            required
            placeholder="25000"
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="md:col-span-2">
          <hr className="border-gray-200" />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RENAVAM *
          </label>
          <Milestone
            className="absolute left-3 top-9 text-gray-400"
            size={20}
          />
          <input
            type="text"
            name="renavam"
            value={formData.renavam}
            onChange={handleChange}
            required
            placeholder="00000000000"
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chassi *
          </label>
          <Shield className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="text"
            name="chassis"
            value={formData.chassis}
            onChange={handleChange}
            required
            placeholder="9BW..."
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="md:col-span-2">
          <CustomSelect
            label="Status *"
            value={formData.status}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
            options={statusOptions}
            Icon={CheckSquare}
          />
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

export default VehicleForm;
