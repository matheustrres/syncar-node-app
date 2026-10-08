"use client";

import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import Modal from "./Modal";
import { useToast } from "@/context/ToastContext";
import styles from "./UpgradeModal.module.css";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceName: string;
  monthlyPrice: string;
  annualPrice: string;
  annualSavings?: string;
}

const proFeatures = [
  "Veículos, motoristas e contratos ilimitados",
  "Relatórios avançados e detalhados",
  "Exportação de dados para CSV",
  "Análise de despesas por tipo e mês",
  "Suporte prioritário por e-mail",
];

export default function UpgradeModal({ isOpen, onClose, resourceName, monthlyPrice, annualPrice, annualSavings }: UpgradeModalProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  async function handleUpgrade() {
    setIsLoading(true);
    try {
      const priceId = billingCycle === "monthly"
        ? process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID;
      const response = await fetch("/api/stripe/checkout-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      if (!response.ok) throw new Error("Falha ao iniciar o processo de pagamento.");
      const { url } = await response.json();
      window.location.href = url;
    } catch {
      showToast("Erro ao fazer upgrade. Tente novamente.", "error");
      setIsLoading(false);
    }
  }

  return <Modal isOpen={isOpen} onClose={onClose} title="Plano Profissional" size="lg">
    <div className={styles.content}>
      <span className={styles.icon} aria-hidden="true"><Sparkles size={24} /></span>
      <h3>Mais recursos para acompanhar sua operação</h3>
      <p className={styles.description}>O recurso {resourceName} está disponível no plano Profissional.</p>
      <ul className={styles.features}>{proFeatures.map(feature => <li key={feature}><Check size={16} aria-hidden="true" />{feature}</li>)}</ul>
      <fieldset className={styles.billing}><legend>Escolha a cobrança</legend><div className={styles.billingOptions}>
        <button type="button" className={billingCycle === "monthly" ? styles.selected : ""} aria-pressed={billingCycle === "monthly"} onClick={() => setBillingCycle("monthly")}><span>Mensal</span><strong>{monthlyPrice}</strong><small>por mês</small></button>
        <button type="button" className={billingCycle === "annual" ? styles.selected : ""} aria-pressed={billingCycle === "annual"} onClick={() => setBillingCycle("annual")}><span>Anual</span><strong>{annualPrice}</strong><small>por ano{annualSavings ? ` · ${annualSavings}` : ""}</small></button>
      </div></fieldset>
      <button className={styles.upgrade} onClick={handleUpgrade} disabled={isLoading}>{isLoading ? "Aguarde..." : "Continuar para contratação"}{!isLoading && <ArrowRight size={17} />}</button>
      <button className={styles.cancel} onClick={onClose} disabled={isLoading}>Continuar no Básico</button>
    </div>
  </Modal>;
}
