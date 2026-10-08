"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CarFront, ChartNoAxesCombined, Users, FileText, Wallet,
  ChartColumnIncreasing, Settings, Wrench, X,
} from "lucide-react";

const navGroups = [
  {
    label: "Painel",
    items: [{ href: "/dashboard", icon: ChartNoAxesCombined, label: "Visão geral" }],
  },
  {
    label: "Operação",
    items: [
      { href: "/dashboard/vehicles", icon: CarFront, label: "Veículos" },
      { href: "/dashboard/maintenance", icon: Wrench, label: "Manutenções" },
      { href: "/dashboard/drivers", icon: Users, label: "Motoristas" },
      { href: "/dashboard/contracts", icon: FileText, label: "Contratos" },
    ],
  },
  {
    label: "Gestão",
    items: [
      { href: "/dashboard/financial", icon: Wallet, label: "Financeiro" },
      { href: "/dashboard/reports", icon: ChartColumnIncreasing, label: "Relatórios" },
    ],
  },
  {
    label: "Conta",
    items: [{ href: "/dashboard/profile", icon: Settings, label: "Meu perfil" }],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Fechar menu de navegação"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-syncar-brand/60 lg:hidden"
        />
      )}
      <aside
        id="dashboard-navigation"
        aria-label="Navegação principal"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-syncar-brand text-white transition-transform duration-200 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 flex-none items-center justify-between border-b border-white/10 px-5">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2 rounded text-xl font-bold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-syncar-action">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-syncar-action text-syncar-brand"><CarFront size={21} aria-hidden="true" /></span>
            syncar<span className="-ml-2 text-syncar-action">.</span>
          </Link>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Fechar menu" className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-syncar-action lg:hidden">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Seções da plataforma">
          <div className="space-y-5">
            {navGroups.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <div className="mb-2 flex items-center gap-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#afc6bd]" aria-hidden="true">
                  <span>{group.label}</span>
                  <span className="h-px flex-1 bg-white/15" />
                </div>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-action ${active ? "bg-syncar-action text-syncar-brand" : "text-[#d2dfda] hover:bg-white/10 hover:text-white"}`}
                        >
                          <item.icon size={19} strokeWidth={1.8} aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-xs text-[#afc6bd]">Gestão de frota e locações</div>
      </aside>
    </>
  );
}
