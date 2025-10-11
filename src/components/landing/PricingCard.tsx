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
}

export default function PricingCard({
  planName,
  price,
  priceDescription,
  features,
  buttonText,
  isFeatured = false,
  disabled = false,
}: PricingCardProps) {
  const cardClasses = `bg-white p-8 rounded-2xl shadow-lg flex flex-col h-full ${isFeatured ? "border-4 border-blue-600 relative" : "border-4 border-transparent"}`;
  const buttonClasses = `w-full mt-auto px-6 py-3 rounded-lg font-semibold transition-colors ${
    disabled
      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
      : isFeatured
        ? "bg-blue-600 text-white hover:bg-blue-700"
        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
  }`;

  return (
    <div className={cardClasses}>
      {isFeatured && (
        <div className="absolute top-0 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Mais Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{planName}</h3>
      <p className="text-4xl font-extrabold text-gray-900 mb-2">{price}</p>
      <p className="text-gray-500 mb-6">{priceDescription}</p>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <Check className="text-green-500" size={20} />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <button className={buttonClasses} disabled={disabled}>
        {disabled ? "Em Breve" : buttonText}
      </button>
    </div>
  );
}
