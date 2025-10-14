"use client";

import Modal from "./Modal";
import { ArrowRight, Star, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceName: string;
}

const proFeatures = [
  "Recursos ilimitados (veículos, motoristas, etc.)",
  "Múltiplos usuários e permissões",
  "Alertas e notificações automáticas",
  "Relatórios avançados e exportação de dados",
];

export default function UpgradeModal({
  isOpen,
  onClose,
  resourceName,
}: UpgradeModalProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const priceId =
        billingCycle === "monthly"
          ? process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID
          : process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID;
      const response = await fetch("/api/stripe/checkout-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });
      if (!response.ok) {
        throw new Error("Falha ao iniciar o processo de pagamento.");
      }
      const { url } = await response.json();
      window.location.href = url;
    } catch {
      showToast("Erro ao fazer upgrade. Tente novamente.", "error");
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="p-4 sm:p-5">
        <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
          <Star className="text-white" size={28} />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800">
            Vá além com o Plano Profissional
          </h3>
          <p className="text-gray-500 mt-2 mb-5">
            Você atingiu o limite de {resourceName} do Plano Básico.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-3">
            Ao fazer o upgrade, você desbloqueia:
          </h4>
          <ul className="space-y-2">
            {proFeatures.map((feature, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <CheckCircle
                  className="text-blue-500 mt-0.5 flex-shrink-0"
                  size={16}
                />
                <span className="text-gray-600 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Seletor de Período */}
        <div className="flex justify-center items-center gap-4 my-6">
          <span
            className={`font-semibold ${billingCycle === "monthly" ? "text-blue-600" : "text-gray-500"}`}
          >
            Mensal
          </span>
          <button
            onClick={() =>
              setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")
            }
            className="relative w-14 h-8 bg-gray-200 rounded-full p-1 transition-colors duration-300 ease-in-out"
            aria-label="Alternar para plano anual"
          >
            <span
              className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${billingCycle === "annual" ? "translate-x-6" : ""}`}
            />
          </button>
          <span
            className={`font-semibold ${billingCycle === "annual" ? "text-blue-600" : "text-gray-500"}`}
          >
            Anual (Economize 2 meses)
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            className="w-full bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            onClick={handleUpgrade}
            disabled={isLoading}
          >
            {isLoading ? "Aguarde..." : "Fazer upgrade agora"}
            {!isLoading && <ArrowRight size={18} />}
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-500 font-medium py-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            Continuar no Básico
          </button>
        </div>
      </div>
    </Modal>
  );
}
