"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import Toast from "@/components/ui/Toast";

interface ToastContextType {
  showToast: (message: string, type: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const hideToast = () => {
    if (toast) {
      setToast({ ...toast, isVisible: false });
      setTimeout(() => {
        setToast(null);
      }, 300); // Allow for fade-out animation
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
