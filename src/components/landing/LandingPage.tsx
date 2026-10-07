"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowUpRight } from "lucide-react";
import Header from "./Header";
import PricingCard from "./PricingCard";
import ProductPreview from "./ProductPreview";
import HeroSection from "./HeroSection";
import BenefitsSection from "./BenefitsSection";
import HowItWorks from "./HowItWorks";
import styles from "./landing.module.css";
const basicFeatures = [
    "Dashboard com resumo financeiro",
    "Até 3 veículos e 3 motoristas",
    "Contratos e pagamentos",
    "Registro de manutenções",
    "Notificações automáticas",
];
const professionalFeatures = [
    "Todos os recursos do Básico",
    "Veículos, motoristas e contratos ilimitados",
    "Relatórios avançados e detalhados",
    "Exportação de dados para CSV",
    "Análise de despesas por tipo e mês",
    "Suporte prioritário por e-mail",
];
export default function LandingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
    const [isLoading, setIsLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState("");
    const { status } = useSession();
    const router = useRouter();
    const handleUpgradeClick = async () => {
        if (status === "loading" || isLoading)
            return;
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        setIsLoading(true);
        setCheckoutError("");
        try {
            const priceId = billingCycle === "monthly"
                ? process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID
                : process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID;
            if (!priceId)
                throw new Error("Stripe price ID is not configured");
            const response = await fetch("/api/stripe/checkout-sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId }),
            });
            if (!response.ok)
                throw new Error("Failed to create checkout session");
            const { url } = await response.json();
            if (!url)
                throw new Error("Checkout session has no URL");
            window.location.href = url;
        }
        catch (error) {
            console.error(error);
            setCheckoutError("Não foi possível iniciar a contratação. Tente novamente.");
            setIsLoading(false);
        }
    };
    return (<div className={styles.landing}>
      <Header />
      <main id="main-content">
        <div id="inicio"/>
        <HeroSection />
    <div className={styles["trustline"]}>
    <div className={styles["wrap"] + " " + styles["trust-inner"]}>
    <span>Um fluxo conectado para toda a operação</span>
    <b>01 &nbsp; Frota</b>
    <b>02 &nbsp; Contratos</b>
    <b>03 &nbsp; Cobranças</b>
    <b>04 &nbsp; Resultados</b>
    </div>
    </div>
    <BenefitsSection />
    <ProductPreview />
    <HowItWorks />
        <section id="planos" className={styles.pricing}>
          <div className={styles.container}>
            <div className={styles.pricingHeading}>
              <div className={styles.sectionIntro}>
                <h2>Comece do seu tamanho.<br />Cresça no seu ritmo.</h2>
                <p>Comece grátis e amplie os recursos quando precisar.</p>
              </div>
              <div className={styles.billingControl}>
                <div className={styles.billingSwitch} role="group" aria-label="Período de cobrança">
                  <button type="button" aria-pressed={billingCycle === "monthly"} disabled={isLoading} onClick={() => setBillingCycle("monthly")}>Mensal</button>
                  <button type="button" aria-pressed={billingCycle === "annual"} disabled={isLoading} onClick={() => setBillingCycle("annual")}>Anual</button>
                </div>
                <p>Economize R$ 99,80 no plano anual</p>
              </div>
            </div>
            <div className={styles.pricingGrid}>
              <PricingCard planName="Básico" planDescription="Para organizar sua frota desde o primeiro veículo." price="Grátis" priceDescription="Para sempre" features={basicFeatures} buttonText="Começar grátis" buttonNote="Até 3 veículos e 3 motoristas." onButtonClick={() => router.push("/login?mode=register")}/>
              <PricingCard planName="Profissional" planDescription="Para ampliar a operação e analisar os resultados." price={billingCycle === "monthly" ? "R$ 49,90" : "R$ 499,00"} priceDescription={billingCycle === "monthly" ? "/mês" : "/ano"} billingNote={billingCycle === "annual" ? "Equivalente a R$ 41,58/mês, cobrado anualmente" : "Cobrança mensal"} features={professionalFeatures} buttonText={status === "authenticated" ? "Contratar Profissional" : "Entrar para contratar"} buttonNote={status === "authenticated" ? "Continue para a contratação do plano." : "Entre na sua conta para contratar."} isFeatured isLoading={isLoading || status === "loading"} onButtonClick={handleUpgradeClick}/>
            </div>
            {checkoutError && <p role="alert" className={styles.checkoutError}>{checkoutError}</p>}
          </div>
        </section>
    <section className={styles["last-cta"]}>
    <div className={styles["wrap"] + " " + styles["cta-panel"]}>
    <div>
    <h2>Sua frota tem potencial. Tenha os números para enxergá-lo.</h2>
    <p>Comece com o plano gratuito e organize a operação em um só lugar.</p>
    </div>
    <a className={styles["btn-primary"]} href="#planos">Conhecer os planos <span aria-hidden="true">
    <ArrowUpRight size={18} aria-hidden="true"/>
    </span>
    </a>
    </div>
    </section>
    </main>
  <footer className={styles["footer"]}>
    <div className={styles["wrap"] + " " + styles["footer-inner"]}>
    <a className={styles["logo"]} href="#inicio">
    <span className={styles["logo-symbol"]}>
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M5 18.5 8 10h16l3 8.5M5 18.5h22v7H5v-7ZM9 25.5v2m14-2v2M9 19h3m8 0h3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    </span>syncar.</a>
    <span>© {new Date().getFullYear()} SynCar. Todos os direitos reservados.</span>
    <a href="#inicio">Voltar ao início <ArrowUpRight size={16} aria-hidden="true"/>
    </a>
    </div>
    </footer>
    </div>);
}
