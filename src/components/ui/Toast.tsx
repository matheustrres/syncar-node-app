"use client";

import { CheckCircle, AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({
  message,
  type,
  isVisible,
  onClose,
}: ToastProps) {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  const baseClasses =
    "fixed top-5 right-5 w-full max-w-sm p-4 rounded-lg shadow-lg flex items-center gap-4 transition-transform duration-300 ease-in-out z-[9999]";
  const transformClass = show ? "translate-x-0" : "translate-x-[120%]";
  const Icon = type === "success" ? CheckCircle : AlertTriangle;

  return (
    <div role={type === "error" ? "alert" : "status"} className={`${baseClasses} rounded-syncar-panel border border-syncar-border bg-syncar-surface text-syncar-text shadow-syncar-overlay ${transformClass}`}>
      <Icon
        aria-hidden="true"
        className={`h-6 w-6 shrink-0 ${type === "success" ? "text-syncar-success" : "text-syncar-danger"}`}
      />
      <p className="flex-grow font-medium">{message}</p>
      <button onClick={onClose} aria-label="Fechar notificação" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-syncar-control text-syncar-muted hover:bg-syncar-surface-subtle hover:text-syncar-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-syncar-focus">
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
