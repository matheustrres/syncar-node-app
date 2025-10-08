"use client";

import { Driver } from "@/types";
import { useState, useEffect, FormEvent } from "react";
import { IMaskInput } from "react-imask";
import {
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  MapPin,
  CheckSquare,
} from "lucide-react";

interface DriverFormProps {
  initialData?: Driver | null;
  onSave: (data: Omit<Driver, "id" | "userId">) => void;
  onCancel: () => void;
}

const DriverForm: React.FC<DriverFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    cnh: "",
    cnhValidity: "",
    address: "",
    status: "Ativo",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        cpf: initialData.cpf,
        phone: initialData.phone,
        email: initialData.email,
        cnh: initialData.cnh,
        cnhValidity: initialData.cnhValidity.split("T")[0],
        address: initialData.address,
        status: initialData.status,
      });
    }
  }, [initialData]);

  // Manipulador para inputs e selects PADRÃO
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manipulador específico para os inputs com MÁSCARA
  const handleMaskedInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      cnhValidity: new Date(formData.cnhValidity).toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="md:col-span-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome completo *
          </label>
          <User className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Digite o nome completo"
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF *
          </label>
          <FileText className="absolute left-3 top-9 text-gray-400" size={20} />
          <IMaskInput
            mask="000.000.000-00"
            name="cpf"
            value={formData.cpf}
            onAccept={(value) => handleMaskedInputChange("cpf", value)}
            placeholder="000.000.000-00"
            required
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone *
          </label>
          <Phone className="absolute left-3 top-9 text-gray-400" size={20} />
          <IMaskInput
            mask="(00) 00000-0000"
            name="phone"
            value={formData.phone}
            onAccept={(value) => handleMaskedInputChange("phone", value)}
            placeholder="(00) 00000-0000"
            required
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <Mail className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="email@exemplo.com"
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNH *
          </label>
          <FileText className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="text"
            name="cnh"
            value={formData.cnh}
            onChange={handleChange}
            required
            placeholder="00000000000"
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Validade CNH *
          </label>
          <Calendar className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="date"
            name="cnhValidity"
            value={formData.cnhValidity}
            onChange={handleChange}
            required
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço *
          </label>
          <MapPin className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Rua, Número, Bairro, Cidade - Estado"
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <CheckSquare
            className="absolute left-3 top-9 text-gray-400"
            size={20}
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
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

export default DriverForm;
