"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CarFront, ChartNoAxesCombined, Users, FileText, Wallet,
  ChartColumnIncreasing, Settings, Wrench, X, PanelLeftClose, PanelLeftOpen,
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
];

interface SidebarProps {
  isOpen: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, isExpanded, onClose, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const driversItemRef = useRef<HTMLLIElement>(null);
  const [toggleTop, setToggleTop] = useState<number | null>(null);

  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    const nav = navRef.current;
    const driversItem = driversItemRef.current;
    if (!sidebar || !nav || !driversItem) return;

    const updateTogglePosition = () => {
      const sidebarRect = sidebar.getBoundingClientRect();
      const itemRect = driversItem.getBoundingClientRect();
      setToggleTop(itemRect.top + itemRect.height / 2 - sidebarRect.top);
    };

    updateTogglePosition();
    const observer = new ResizeObserver(updateTogglePosition);
    observer.observe(sidebar);
    observer.observe(driversItem);
    nav.addEventListener("scroll", updateTogglePosition);
    window.addEventListener("resize", updateTogglePosition);
    return () => {
      observer.disconnect();
      nav.removeEventListener("scroll", updateTogglePosition);
      window.removeEventListener("resize", updateTogglePosition);
    };
  }, [isExpanded]);

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
        ref={sidebarRef}
        id="dashboard-navigation"
        aria-label="Navegação principal"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-syncar-brand text-white transition-[width,transform] duration-200 lg:translate-x-0 ${isExpanded ? "lg:w-64" : "lg:w-[4.5rem]"} ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className={`flex h-16 flex-none items-center border-b border-white/10 px-5 ${isExpanded ? "justify-between" : "lg:justify-center"}`}>
          <Link href="/dashboard" onClick={onClose} aria-label="SynCar, visão geral" className="flex items-center gap-2 rounded text-xl font-bold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-syncar-action">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-syncar-action text-syncar-brand"><CarFront size={21} aria-hidden="true" /></span>
            <span className={isExpanded ? "" : "lg:hidden"}>syncar<span className="-ml-2 text-syncar-action">.</span></span>
          </Link>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Fechar menu" className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-syncar-action lg:hidden">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav ref={navRef} className={`flex-1 overflow-y-auto py-5 ${isExpanded ? "px-3" : "px-2 lg:px-2"}`} aria-label="Seções da plataforma">
          <div className="space-y-5">
            {navGroups.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <div className={`mb-2 flex items-center gap-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#afc6bd] ${isExpanded ? "" : "lg:justify-center"}`} aria-hidden="true">
                  <span className={isExpanded ? "" : "lg:hidden"}>{group.label}</span>
                  <span className={`h-px flex-1 bg-white/15 ${isExpanded ? "" : "lg:hidden"}`} />
                </div>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
                    return (
                      <li key={item.href} ref={item.href === "/dashboard/drivers" ? driversItemRef : undefined}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          aria-current={active ? "page" : undefined}
                          aria-label={isExpanded ? undefined : item.label}
                          title={isExpanded ? undefined : item.label}
                          className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-action ${isExpanded ? "" : "lg:justify-center lg:px-0"} ${active ? "bg-syncar-action text-syncar-brand" : "text-[#d2dfda] hover:bg-white/10 hover:text-white"}`}
                        >
                          <item.icon size={19} strokeWidth={1.8} aria-hidden="true" />
                          <span className={isExpanded ? "" : "lg:hidden"}>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </nav>
        <button
          type="button"
          onClick={onToggle}
          aria-label={isExpanded ? "Recolher menu de navegação" : "Expandir menu de navegação"}
          aria-expanded={isExpanded}
          aria-controls="dashboard-navigation"
          title={isExpanded ? "Recolher menu" : "Expandir menu"}
          style={toggleTop === null ? undefined : { top: toggleTop }}
          className={`absolute right-0 z-50 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-syncar-brand text-[#d2dfda] shadow-md transition-colors hover:bg-syncar-action hover:text-syncar-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-action lg:flex ${toggleTop === null ? "invisible" : ""}`}
        >
          {isExpanded ? <PanelLeftClose size={18} aria-hidden="true" /> : <PanelLeftOpen size={18} aria-hidden="true" />}
        </button>
        <div className={`border-t border-white/10 p-3 ${isExpanded ? "" : "lg:px-2"}`}>
          <Link
            href="/dashboard/profile"
            onClick={onClose}
            aria-current={pathname.startsWith("/dashboard/profile") ? "page" : undefined}
            title={isExpanded ? undefined : "Meu perfil"}
            aria-label={isExpanded ? undefined : "Meu perfil"}
            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-action ${isExpanded ? "" : "lg:justify-center lg:px-0"} ${pathname.startsWith("/dashboard/profile") ? "bg-syncar-action text-syncar-brand" : "text-[#d2dfda] hover:bg-white/10 hover:text-white"}`}
          >
            <Settings size={19} strokeWidth={1.8} aria-hidden="true" />
            <span className={isExpanded ? "" : "lg:hidden"}>Meu perfil</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
