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
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-red-50 border border-red-200 h-full">
      <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
      <h3 className="text-xl font-semibold text-red-800 mb-2">
        Ocorreu um Erro
      </h3>
      <p className="text-red-600 mb-6">{errorMessage}</p>
      <button
        onClick={onRetry}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
      >
        <RefreshCw size={18} />
        Tentar novamente
      </button>
    </div>
  );
}
