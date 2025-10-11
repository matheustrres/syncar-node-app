"use client";

import Modal from "./Modal";
import { ArrowRight, Star, CheckCircle } from "lucide-react";

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
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="p-4 sm:p-5">
        <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
          <Star className="text-white" size={28} />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800">Vá além com o Plano Profissional</h3>
          <p className="text-gray-500 mt-2 mb-5">
            Você atingiu o limite de {resourceName} do Plano Básico.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-3">Ao fazer o upgrade, você desbloqueia:</h4>
            <ul className="space-y-2">
                {proFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                        <CheckCircle className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                        <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3">
            <button 
                className="w-full bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
                // onClick={() => { /* Lógica de checkout aqui */ }}
            >
                Fazer upgrade agora
                <ArrowRight size={18} />
            </button>
            <button 
                onClick={onClose}
                className="w-full text-gray-500 font-medium py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                Continuar no Básico
            </button>
        </div>
      </div>
    </Modal>
  );
}
