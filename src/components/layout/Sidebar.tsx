"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CarFront, House, Users, FileText, Wallet,
  ChartColumnIncreasing, Settings, Wrench, X,
} from "lucide-react";

const navGroups = [
  {
    label: "Painel",
    items: [{ href: "/dashboard", icon: House, label: "Visão geral" }],
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
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeAndRestoreFocus = useCallback(() => {
    onClose();
    requestAnimationFrame(() => document.getElementById("dashboard-menu-button")?.focus());
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAndRestoreFocus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeAndRestoreFocus]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Fechar menu de navegação"
          onClick={closeAndRestoreFocus}
          className="fixed inset-0 z-30 bg-syncar-brand/60 lg:hidden"
        />
      )}
      <aside
        id="dashboard-navigation"
        aria-label="Navegação principal"
        className={`fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-white/10 bg-syncar-brand text-white lg:flex lg:w-[17.25rem] ${isOpen ? "flex" : "hidden"}`}
      >
        <div className="flex h-20 flex-none items-center justify-between border-b border-white/10 px-5">
          <Link href="/dashboard" onClick={onClose} aria-label="SynCar, visão geral" className="flex items-center gap-3 rounded text-[22px] font-bold tracking-[-0.03em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-syncar-action">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-syncar-action text-syncar-brand">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3.5 17.5 8.3 7h12.2l-4.8 10.5H3.5Z" fill="currentColor" />
              </svg>
            </span>
            <span>syncar<span className="ml-1 text-syncar-action">.</span></span>
          </Link>
          <button ref={closeButtonRef} type="button" onClick={closeAndRestoreFocus} aria-label="Fechar menu" className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-syncar-action lg:hidden">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-8" aria-label="Seções da plataforma">
          <div className="space-y-5">
            {navGroups.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <div className="mb-3 px-4 text-xs font-bold uppercase tracking-[0.08em] text-[#afc6bd]">
                  {group.label}
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
                          className={`flex min-h-12 items-center gap-3 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-action ${active ? "bg-syncar-action text-syncar-brand" : "text-[#d2dfda] hover:bg-white/10 hover:text-white"}`}
                        >
                          <item.icon className="shrink-0" size={19} strokeWidth={1.8} aria-hidden="true" />
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
        <div className="border-t border-white/10 p-2">
          <Link
            href="/dashboard/profile"
            onClick={onClose}
            aria-current={pathname.startsWith("/dashboard/profile") ? "page" : undefined}
            className={`flex min-h-12 items-center gap-3 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-action ${pathname.startsWith("/dashboard/profile") ? "bg-syncar-action text-syncar-brand" : "text-[#d2dfda] hover:bg-white/10 hover:text-white"}`}
          >
            <Settings className="shrink-0" size={19} strokeWidth={1.8} aria-hidden="true" />
            <span>Meu perfil</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
