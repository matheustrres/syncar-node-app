import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "SynCar — Gestão de frotas para locadoras",
  description: "Organize veículos, motoristas, contratos e financeiro em um só lugar. Comece grátis com até 3 veículos e 3 motoristas.",
};

export default async function Home() {
  return <LandingPage />;
}
