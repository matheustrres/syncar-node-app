import { Lock } from "lucide-react";

interface UpgradePlaceholderProps {
  featureName: string;
  children: React.ReactNode;
  onUpgradeClick: () => void;
}

export default function UpgradePlaceholder({
  featureName,
  children,
  onUpgradeClick,
}: UpgradePlaceholderProps) {
  return (
    <div className="relative rounded-lg overflow-hidden">
      {/* 1. Background Content (rendered normally) */}
      {children}

      {/* 2. The "Glass Pane" Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gray-100/70 rounded-lg">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-md">
          <Lock className="w-6 h-6 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{featureName}</h3>
        <p className="text-gray-600 mt-1 mb-6 max-w-xs">
          Faça o upgrade para o plano Profissional para acessar este recurso.
        </p>
        <button
          onClick={onUpgradeClick}
          className="bg-blue-600 text-white font-semibold px-8 py-2.5 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 ease-in-out"
        >
          Fazer upgrade
        </button>
      </div>
    </div>
  );
}
