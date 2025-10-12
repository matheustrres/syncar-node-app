"use client";

import CurrencyInput, { CurrencyInputProps } from "react-currency-input-field";
import { LucideIcon } from "lucide-react";

interface CustomCurrencyInputProps extends CurrencyInputProps {
  label: string;
  Icon: LucideIcon;
}

const CustomCurrencyInput: React.FC<CustomCurrencyInputProps> = ({
  label,
  Icon,
  name,
  value,
  onValueChange,
  required,
}) => {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Icon className="absolute left-3 top-9 text-gray-400" size={20} />
      <CurrencyInput
        id={name}
        name={name}
        className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-100"
        value={value}
        onValueChange={onValueChange}
        intlConfig={{ locale: "pt-BR", currency: "BRL" }}
        placeholder="R$ 0,00"
        required={required}
        decimalsLimit={2}
        decimalScale={2}
        allowNegativeValue={false}
      />
    </div>
  );
};

export default CustomCurrencyInput;
