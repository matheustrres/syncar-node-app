"use client";

import { Check } from "lucide-react";

interface PricingCardProps {
  planName: string;
  price: string;
  priceDescription: string;
  features: string[];
  buttonText: string;
  isFeatured?: boolean;
  disabled?: boolean;
  savings?: string;
  isLoading?: boolean;
  onButtonClick?: () => void;
}

export default function PricingCard({
  planName,
  price,
  priceDescription,
  features,
  buttonText,
  isFeatured = false,
  disabled = false,
  savings,
  isLoading = false,
  onButtonClick,
}: PricingCardProps) {
  const cardClasses = `bg-white p-8 rounded-2xl shadow-lg flex flex-col h-full ${
    isFeatured
      ? "border-4 border-blue-600 relative"
      : "border-4 border-transparent"
  }`;
  const buttonClasses = `w-full mt-auto px-6 py-3 rounded-lg font-semibold transition-colors ${
    disabled || isLoading
      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
      : isFeatured
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
  }`;

  return (
    <div className={cardClasses}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-2xl font-bold text-gray-800">{planName}</h3>
        {isFeatured && (
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Mais popular
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2 mb-6">
        <p className="text-4xl font-extrabold text-gray-900">{price}</p>
        <p className="text-gray-500">{priceDescription}</p>
        {savings && (
          <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
            {savings}
          </div>
        )}
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <Check className="text-green-500" size={20} />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={buttonClasses}
        disabled={disabled || isLoading}
        onClick={onButtonClick}
      >
        {isLoading
          ? "Redirecionando..."
          : disabled
          ? "Em breve"
          : buttonText}
      </button>
    </div>
  );
}
