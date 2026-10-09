"use client";

import React, { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface ForgotPasswordFormProps {
  onClose: () => void;
  className?: string;
}

export default function ForgotPasswordForm({
  onClose,
  className = "",
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar email de recuperação.");
      }
      showToast("Email de recuperação enviado com sucesso!", "success");
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 p-4 ${className}`}>
      <p className="mb-4 text-sm text-syncar-text-muted">
        Informe seu email para receber as instruções de recuperação de senha.
      </p>
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold text-syncar-text"
        >
          Email *
        </label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-syncar-text-muted"
            size={18}
          />
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 w-full rounded-lg border border-syncar-border bg-syncar-surface py-2 pl-11 pr-4 text-sm text-syncar-text placeholder:text-syncar-text-muted focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20"
            placeholder="seu@email.com"
          />
        </div>
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="min-h-11 rounded-lg border border-syncar-border bg-syncar-surface px-5 py-2 text-sm font-semibold text-syncar-text transition-colors hover:bg-syncar-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-focus disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-syncar-brand px-5 py-2 text-sm font-semibold text-syncar-brand-contrast transition-colors hover:bg-syncar-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-focus disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Enviar"}
        </button>
      </div>
    </form>
  );
}
