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
  const typeClasses = {
    success: "bg-green-50 text-green-800",
    error: "bg-red-50 text-red-800",
  };
  const transformClass = show ? "translate-x-0" : "translate-x-[120%]";
  const Icon = type === "success" ? CheckCircle : AlertTriangle;

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${transformClass}`}>
      <Icon
        className={`w-6 h-6 ${type === "success" ? "text-green-500" : "text-red-500"}`}
      />
      <p className="flex-grow font-medium">{message}</p>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
