"use client";

import { Vehicle, WithoutBaseItem } from "@/types";
import { useState, useEffect, FormEvent, FocusEvent } from "react";
import { IMaskInput } from "react-imask";
import {
  CheckSquare,
  Hash,
  Palette,
  Gauge,
  Shield,
  Milestone,
  Calendar,
  Car,
  AlertCircle,
} from "lucide-react";
import CustomSelect, { SelectOption } from "../ui/CustomSelect";

import { normalizeString } from "@/lib/string-utils";

interface VehicleFormProps {
  initialData?: Vehicle | null;
  apiError?: string | null;
  isSaving?: boolean;
  onSave: (data: WithoutBaseItem<Vehicle>) => void;
  onCancel: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  initialData,
  apiError,
  isSaving,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    plate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    renavam: "",
    chassis: "",
    km: 0,
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
        plate: initialData.plate || "",
        brand: initialData.brand || "",
        model: initialData.model || "",
        year: initialData.year || new Date().getFullYear(),
        color: initialData.color || "",
        renavam: initialData.renavam || "",
        chassis: initialData.chassis || "",
        km: initialData.km || 0,
        status: initialData.status || "Disponível",
      });
    }
  }, [initialData]);

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.toUpperCase();
    const cleanValue = rawValue.replace(/[^A-Z0-9]/g, "");
    let formattedValue = cleanValue;
    const isLikelyOldFormat =
      cleanValue.length > 3 && /^[0-9]$/.test(cleanValue[3]);
    const isLikelyMercosul =
      cleanValue.length > 4 && /^[A-Z]$/.test(cleanValue[4]);
    if (isLikelyOldFormat && !isLikelyMercosul) {
      formattedValue = `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 7)}`;
    } else {
      formattedValue = cleanValue.slice(0, 7);
    }
    setFormData((prev) => ({ ...prev, plate: formattedValue }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaskedInputChange = (name: string, value: string) => {
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
      km: parseInt(String(formData.km).replace(/\./g, "")) || 0,
      plateNormalized: normalizeString(formData.plate),
      modelNormalized: normalizeString(formData.model),
    });
  };

  const inputStyle =
    "pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-100";

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
            onChange={handlePlateChange}
            required
            placeholder="ABC-1234 ou ABC1D23"
            className={inputStyle}
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
            className={inputStyle}
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
            className={inputStyle}
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
            className={inputStyle}
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
            value={formData.color.toUpperCase()}
            onChange={handleChange}
            required
            placeholder="Ex: Branco"
            className={inputStyle}
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quilometragem (km) *
          </label>
          <Gauge className="absolute left-3 top-9 text-gray-400" size={20} />
          <IMaskInput
            mask={Number}
            thousandsSeparator="."
            name="km"
            value={String(formData.km)}
            onAccept={(value) => handleMaskedInputChange("km", String(value))}
            onFocus={handleFocus}
            onBlur={handleNumberFieldBlur}
            required
            placeholder="25.000"
            className={inputStyle}
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
          <IMaskInput
            mask="00000000000"
            name="renavam"
            value={formData.renavam}
            onAccept={(value) =>
              handleMaskedInputChange("renavam", String(value))
            }
            required
            placeholder="00000000000"
            className={inputStyle}
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chassi *
          </label>
          <Shield className="absolute left-3 top-9 text-gray-400" size={20} />
          <IMaskInput
            mask={/^[A-HJ-NP-Z0-9]{0,17}$/}
            prepare={(str: string) => str.toUpperCase()}
            name="chassis"
            value={formData.chassis}
            onAccept={(value) =>
              handleMaskedInputChange("chassis", String(value))
            }
            required
            placeholder="9BW..."
            className={inputStyle}
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

export default VehicleForm;
