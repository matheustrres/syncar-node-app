"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  variant?: "default" | "platform";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "2xl",
  variant = "default",
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      const dialogs = document.querySelectorAll<HTMLElement>(
        '[role="dialog"][aria-modal="true"]',
      );
      if (dialogs[dialogs.length - 1] !== dialogRef.current) return;

      event.preventDefault();
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[90vh] w-full ${sizeClasses[size]} flex-col overflow-hidden ${variant === "platform" ? "rounded-syncar-panel bg-white shadow-2xl" : "bg-white rounded-lg shadow-xl"}`}
      >
        <div className={`flex-shrink-0 flex justify-between items-center ${variant === "platform" ? "border-b border-syncar-border px-5 py-4 sm:px-6" : "p-4 border-b"}`}>
          <h2 className={`text-xl font-semibold ${variant === "platform" ? "text-syncar-text" : "text-gray-800"}`}>{title}</h2>
          <button
            onClick={onClose}
            type="button"
            aria-label="Fechar modal"
            className={`flex h-10 w-10 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-focus ${variant === "platform" ? "text-syncar-text-muted hover:bg-syncar-surface-subtle hover:text-syncar-text" : "text-gray-500 hover:text-gray-800"}`}
          >
            <X size={24} />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto ${variant === "platform" ? "p-5 sm:p-6" : "p-6"}`}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
