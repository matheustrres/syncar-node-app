"use client";

import Link from "next/link";
import {
  Car,
  ShieldCheck,
  DollarSign,
  BarChart2,
  ArrowRight,
} from "lucide-react";
import Header from "./Header";
import Image from "next/image";
import PricingCard from "./PricingCard";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Componente de features simplificado e moderno
const Feature = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm hover:border-blue-500 hover:shadow-md transition-all">
    <div className="flex items-start gap-4">
      <Icon className="text-blue-600 mt-1" size={24} />
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{children}</p>
      </div>
    </div>
  </div>
);

interface PriceInfo {
  price: string;
  priceDescription: string;
  savings?: string;
}

interface Plan {
  planName: string;
  monthly: PriceInfo;
  annual: PriceInfo;
  features: string[];
  buttonText: string;
  isFeatured?: boolean;
  disabled?: boolean;
  action?: () => void;
}

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [isLoading, setIsLoading] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  const handleUpgradeClick = async () => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      setIsLoading(true);
      try {
        const priceId =
          billingCycle === "monthly"
            ? process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID
            : process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID;
        const response = await fetch("/api/stripe/checkout-sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ priceId }),
        });
        if (!response.ok) {
          throw new Error("Failed to create checkout session");
        }
        const { url } = await response.json();
        window.location.href = url;
      } catch (error) {
        console.error(error);
        alert("Ocorreu um erro. Tente novamente.");
        setIsLoading(false);
      }
    }
  };

  const pricingPlans: Plan[] = [
    {
      planName: "Básico",
      monthly: {
        price: "Grátis",
        priceDescription: "Para sempre",
      },
      annual: {
        price: "Grátis",
        priceDescription: "Para sempre",
      },
      features: [
        "Até 3 veículos",
        "Até 3 motoristas",
        "Gestão de contratos",
        "Controle financeiro",
      ],
      buttonText: "Começar agora",
      action: () => router.push("/login"),
    },
    {
      planName: "Profissional",
      monthly: {
        price: "R$ 49,90",
        priceDescription: "/mês",
      },
      annual: {
        price: "R$ 499",
        priceDescription: "/ano",
        savings: "Economize R$ 99,80",
      },
      features: [
        "Veículos ilimitados",
        "Motoristas ilimitados",
        "Histórico de pagamentos",
        "Histórico de despesas",
        "Relatórios avançados",
        "Exportação de dados",
      ],
      buttonText: "Escolher plano",
      isFeatured: true,
      action: handleUpgradeClick,
    },
    {
      planName: "Empresarial",
      monthly: {
        price: "Sob consulta",
        priceDescription: "",
      },
      annual: {
        price: "Sob consulta",
        priceDescription: "",
      },
      features: [
        "Tudo do Profissional",
        "Integração com GPS/Telemetria",
        "Integração com contabilidade",
        "Acesso via API",
        "Suporte prioritário",
      ],
      buttonText: "Entrar em contato",
      disabled: true,
    },
  ];

  return (
    <div className="bg-white min-h-screen text-gray-700">
      <Header />

      {/* Seção Hero */}
      <main className="relative bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="container mx-auto px-4 pt-24 pb-32 text-center md:text-left">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                A gestão da sua frota,{" "}
                <span className="text-blue-600">simples e eficiente</span>.
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
                Controle seus veículos, motoristas e finanças em um só lugar. O
                Syncar automatiza suas tarefas para que você possa focar no
                crescimento do seu negócio.
              </p>
              <Link
                href="/login"
                className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                Começar gratuitamente
                <ArrowRight size={20} />
              </Link>
            </div>
            <div className="mt-12 md:mt-0">
              <Image
                src="/screenshots/dashboard.png"
                alt="Dashboard do Syncar"
                width={1200}
                height={900}
                className="rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Seção de Features */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Tudo o que você precisa
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Funcionalidades pensadas para otimizar sua operação, desde o
              controle de veículos até a gestão financeira e relatórios
              detalhados.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Feature icon={Car} title="Controle de veículos">
              Cadastre e acompanhe toda a sua frota, status, quilometragem e
              manutenções.
            </Feature>
            <Feature icon={ShieldCheck} title="Gestão de contratos">
              Crie e gerencie contratos de aluguel de forma simples, com geração
              automática de pagamentos.
            </Feature>
            <Feature icon={DollarSign} title="Financeiro inteligente">
              Visualize pagamentos pendentes, recebidos e despesas. Tenha uma
              visão clara da saúde financeira do seu negócio.
            </Feature>
            <Feature icon={BarChart2} title="Relatórios completos">
              Acesse relatórios de fluxo de caixa, inadimplência e resumo por
              motorista para tomar decisões baseadas em dados.
            </Feature>
          </div>
        </div>
      </section>

      {/* Seção de Planos (Pricing) */}
      <section id="pricing" className="py-24 bg-gray-50/70">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-gray-600 mt-3">
              Comece pequeno, cresça sem limites.
            </p>
          </div>

          {/* Seletor de Período */}
          <div className="flex justify-center items-center gap-4 mb-10">
            <span
              className={`font-semibold ${
                billingCycle === "monthly" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              Mensal
            </span>
            <button
              onClick={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "annual" : "monthly"
                )
              }
              className="relative w-14 h-8 bg-gray-200 rounded-full p-1 transition-colors duration-300 ease-in-out"
            >
              <span
                className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                  billingCycle === "annual" ? "translate-x-6" : ""
                }`}
              />
            </button>
            <span
              className={`font-semibold ${
                billingCycle === "annual" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              Anual
            </span>
          </div>

          {/* Mobile Carousel (hidden on md and up) */}
          <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-8 -mx-4 px-4 scrollbar-hide">
            {pricingPlans.map((plan) => {
              const priceInfo = plan[billingCycle];
              const wrapperClass =
                "flex-shrink-0 w-[85%] sm:w-[70%] snap-center";
              const card = (
                <PricingCard
                  key={plan.planName}
                  planName={plan.planName}
                  price={priceInfo.price}
                  priceDescription={priceInfo.priceDescription}
                  savings={priceInfo.savings}
                  features={plan.features}
                  buttonText={plan.buttonText}
                  isFeatured={plan.isFeatured}
                  disabled={plan.disabled}
                  isLoading={isLoading && plan.planName === "Profissional"}
                  onButtonClick={plan.action}
                />
              );

              if (plan.disabled) {
                return (
                  <div
                    key={plan.planName}
                    className={`${wrapperClass} opacity-50 grayscale`}
                  >
                    {card}
                  </div>
                );
              }
              return (
                <div key={plan.planName} className={wrapperClass}>
                  {card}
                </div>
              );
            })}
          </div>

          {/* Desktop Grid (hidden below md) */}
          <div className="hidden md:grid grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {pricingPlans.map((plan) => {
              const priceInfo = plan[billingCycle];
              const card = (
                <PricingCard
                  key={plan.planName}
                  planName={plan.planName}
                  price={priceInfo.price}
                  priceDescription={priceInfo.priceDescription}
                  savings={priceInfo.savings}
                  features={plan.features}
                  buttonText={plan.buttonText}
                  isFeatured={plan.isFeatured}
                  disabled={plan.disabled}
                  isLoading={isLoading && plan.planName === "Profissional"}
                  onButtonClick={plan.action}
                />
              );

              if (plan.disabled) {
                return (
                  <div
                    key={plan.planName}
                    className="opacity-50 grayscale h-full"
                  >
                    {card}
                  </div>
                );
              }
              return card;
            })}
          </div>
        </div>
      </section>

      {/* Seção de Visualização da Plataforma */}
      <section id="preview" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Veja o Syncar em ação
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Explore as telas e sinta a simplicidade da nossa plataforma,
              projetada para ser poderosa e fácil de usar.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <Image
              src="/screenshots/dashboard.png"
              alt="Tela da dashboard do Syncar"
              width={1200}
              height={900}
              className="rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            />
            <Image
              src="/screenshots/financial.png"
              alt="Tela de financeiro do Syncar"
              width={1200}
              height={900}
              className="rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <p>
            &copy; {new Date().getFullYear()} Syncar. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
