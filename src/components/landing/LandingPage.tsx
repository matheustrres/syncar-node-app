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
import PricingCard from "./PricingCard"; // Importando o novo componente

const Feature = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
    <div className="flex items-center gap-4 mb-3">
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600">{children}</p>
  </div>
);

export default function LandingPage() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-700">
      <Header />

      {/* Seção Hero */}
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-4">
          A Gestão da sua frota,{" "}
          <span className="text-blue-600">simples e eficiente</span>.
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto mb-8">
          Controle seus veículos, motoristas e finanças em um só lugar. O Syncar
          automatiza suas tarefas para que você possa focar no crescimento do
          seu negócio.
        </p>
        <Link
          href="/login"
          className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          Acessar a plataforma
          <ArrowRight size={20} />
        </Link>
      </main>

      {/* Seção de Features */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800">
              Tudo o que você precisa
            </h2>
            <p className="text-gray-500 mt-2">
              Funcionalidades pensadas para otimizar sua operação.
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
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800">Planos que cabem no seu bolso</h2>
            <p className="text-gray-500 mt-2">Comece pequeno, cresça sem limites.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            <PricingCard
              planName="Básico"
              price="Grátis"
              priceDescription="Para sempre"
              features={[
                "Até 3 veículos",
                "Até 5 motoristas",
                "Gestão de contratos",
                "Controle financeiro",
              ]}
              buttonText="Começar agora"
            />
            <PricingCard
              planName="Profissional"
              price="R$ 49,90"
              priceDescription="/mês"
              features={[
                "Veículos ilimitados",
                "Motoristas ilimitados",
                "Múltiplos usuários e permissões",
                "Alertas e notificações",
                "Relatórios avançados",
                "Exportação de dados",
              ]}
              buttonText="Escolher plano"
              isFeatured
            />
            <div className="opacity-50 grayscale">
              <PricingCard
                planName="Empresarial"
                price="Sob consulta"
                priceDescription=""
                features={[
                  "Tudo do Profissional",
                  "Integração com GPS/Telemetria",
                  "Integração com contabilidade",
                  "Acesso via API",
                  "Suporte prioritário",
                ]}
                buttonText="Entrar em contato"
                disabled
              />
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Visualização da Plataforma */}
      <section id="preview" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800">
              Veja o Syncar em ação
            </h2>
            <p className="text-gray-500 mt-2">
              Explore as telas e sinta a simplicidade da nossa plataforma.
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
      <footer className="bg-gray-800 text-white py-8">
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
