"use client";

import { Vehicle, WithoutBaseItem } from "@/types";
import { useState, useEffect, FormEvent, FocusEvent } from "react";
import { IMaskInput } from "react-imask";
import {
  CircleCheck,
  FileText,
  Hash,
  Palette,
  Gauge,
  Shield,
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
    "h-11 w-full rounded-[var(--syncar-radius-control)] border border-syncar-border bg-syncar-surface pl-11 pr-4 text-sm text-syncar-text placeholder:text-syncar-text-muted focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20";
  const labelStyle = "mb-1.5 block text-sm font-semibold text-syncar-text";
  const iconStyle = "pointer-events-none absolute left-3 top-9 text-syncar-text-muted [stroke-width:1.75]";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <div className="relative">
          <label htmlFor="vehicle-plate" className={labelStyle}>
            Placa *
          </label>

          <Hash className={iconStyle} size={18} aria-hidden="true" />

          <input
            type="text"
            id="vehicle-plate"
            name="plate"
            value={formData.plate}
            onChange={handlePlateChange}
            required
            placeholder="ABC-1234 ou ABC1D23"
            className={inputStyle}
          />
        </div>

        <div className="relative">
          <label htmlFor="vehicle-brand" className={labelStyle}>
            Marca *
          </label>
          <Car className={iconStyle} size={18} aria-hidden="true" />
          <input
            type="text"
            id="vehicle-brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            placeholder="Ex: Toyota"
            className={inputStyle}
          />
        </div>

        <div className="relative">
          <label htmlFor="vehicle-model" className={labelStyle}>
            Modelo *
          </label>
          <Car className={iconStyle} size={18} aria-hidden="true" />
          <input
            type="text"
            id="vehicle-model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            placeholder="Ex: Corolla"
            className={inputStyle}
          />
        </div>

        <div className="relative">
          <label htmlFor="vehicle-year" className={labelStyle}>
            Ano *
          </label>
          <Calendar className={iconStyle} size={18} aria-hidden="true" />
          <input
            type="number"
            id="vehicle-year"
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
          <label htmlFor="vehicle-color" className={labelStyle}>
            Cor *
          </label>
          <Palette className={iconStyle} size={18} aria-hidden="true" />
          <input
            type="text"
            id="vehicle-color"
            name="color"
            value={formData.color.toUpperCase()}
            onChange={handleChange}
            required
            placeholder="Ex: Branco"
            className={inputStyle}
          />
        </div>

        <div className="relative">
          <label htmlFor="vehicle-km" className={labelStyle}>
            Quilometragem (km) *
          </label>
          <Gauge className={iconStyle} size={18} aria-hidden="true" />
          <IMaskInput
            id="vehicle-km"
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
          <hr className="border-syncar-border" />
        </div>

        <div className="relative">
          <label htmlFor="vehicle-renavam" className={labelStyle}>
            RENAVAM *
          </label>
          <FileText
            className={iconStyle}
            size={18}
            aria-hidden="true"
          />
          <IMaskInput
            id="vehicle-renavam"
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
          <label htmlFor="vehicle-chassis" className={labelStyle}>
            Chassi *
          </label>
          <Shield className={iconStyle} size={18} aria-hidden="true" />
          <IMaskInput
            id="vehicle-chassis"
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
            id="vehicle-status"
            variant="platform"
            label="Status *"
            value={formData.status}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
            options={statusOptions}
            Icon={CircleCheck}
          />
        </div>
      </div>
      {apiError && (
        <div role="alert" className="mt-1 flex items-center gap-2 text-sm text-syncar-danger">
          <AlertCircle size={16} />
          <span>{apiError}</span>
        </div>
      )}
      <div className="flex flex-wrap justify-end gap-3 border-t border-syncar-border pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="min-h-11 rounded-[var(--syncar-radius-control)] border border-syncar-border bg-syncar-surface px-5 text-sm font-semibold text-syncar-text hover:bg-syncar-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-focus disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="min-h-11 rounded-[var(--syncar-radius-control)] bg-syncar-action px-6 text-sm font-bold text-syncar-action-text hover:bg-syncar-action-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-focus disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;
