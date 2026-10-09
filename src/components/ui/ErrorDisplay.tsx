"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  errorMessage: string;
  onRetry: () => void;
}

export default function ErrorDisplay({
  errorMessage,
  onRetry,
}: ErrorDisplayProps) {
  return (
    <div role="alert" className="flex h-full flex-col items-center justify-center rounded-syncar-panel border border-syncar-border bg-syncar-surface p-8 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-syncar-danger" aria-hidden="true" />
      <h3 className="mb-2 text-xl font-semibold text-syncar-text">
        Ocorreu um Erro
      </h3>
      <p className="mb-6 text-syncar-muted">{errorMessage}</p>
      <button
        onClick={onRetry}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-syncar-control bg-syncar-brand px-4 py-2 font-semibold text-white transition-colors hover:bg-syncar-brand-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-focus"
      >
        <RefreshCw size={18} />
        Tentar novamente
      </button>
    </div>
  );
}
