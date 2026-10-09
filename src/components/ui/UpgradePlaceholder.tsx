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
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-syncar-panel border border-syncar-border bg-syncar-canvas/90 p-6 text-center backdrop-blur-[2px]">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-syncar-brand shadow-sm">
          <Lock className="h-6 w-6 text-syncar-action" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-syncar-text">{featureName}</h3>
        <p className="mb-6 mt-1 max-w-xs text-sm leading-6 text-syncar-muted">
          Faça o upgrade para o plano Profissional para acessar este recurso.
        </p>
        <button
          onClick={onUpgradeClick}
          className="min-h-11 rounded-syncar-control bg-syncar-action px-8 py-2.5 font-semibold text-syncar-action-text shadow-sm transition-colors hover:bg-syncar-action-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-focus"
        >
          Fazer upgrade
        </button>
      </div>
    </div>
  );
}
