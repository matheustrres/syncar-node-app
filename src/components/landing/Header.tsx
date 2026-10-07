"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CarFront, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import styles from "./landing.module.css";
const navLinks = [
    { href: "#beneficios", label: "Benefícios" },
    { href: "#plataforma", label: "Plataforma" },
    { href: "#como-funciona", label: "Como funciona" },
    { href: "#planos", label: "Planos" },
];
export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const pathname = usePathname();
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);
    useEffect(() => {
        if (!isMenuOpen)
            return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeButtonRef.current?.focus();
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMenuOpen(false);
                menuButtonRef.current?.focus();
            }
            if (event.key === "Tab") {
                const menu = document.getElementById("mobile-navigation");
                const focusable = menu?.querySelectorAll<HTMLElement>("a, button");
                if (!focusable?.length)
                    return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                }
                else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };
        const desktop = window.matchMedia("(min-width: 768px)");
        const closeOnDesktop = () => { if (desktop.matches)
            setIsMenuOpen(false); };
        desktop.addEventListener("change", closeOnDesktop);
        window.addEventListener("keydown", closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", closeOnEscape);
            desktop.removeEventListener("change", closeOnDesktop);
        };
    }, [isMenuOpen]);
    return (<>
      <a href="#main-content" className={styles.skipLink}>Ir para o conteúdo</a>
      <header className={styles.header}>
        <nav aria-label="Navegação principal" className={`${styles.container} ${styles.headerNav}`}>
          <Link href="/" className={styles.brand}>
            <CarFront size={27} className={styles.logoIcon} aria-hidden="true"/>
            syncar.
          </Link>
          <div className={styles.desktopNav}>
            {navLinks.map((link) => (<a key={link.href} href={link.href} className={styles.navLink}>
                {link.label}
              </a>))}
          </div>
          <Link href="/login" className={styles.headerAccess}>
            Acessar plataforma <ArrowUpRight size={17} aria-hidden="true"/>
          </Link>
          <Link href="/login?mode=register" className={styles.headerSignup}>Começar grátis <ArrowUpRight size={16} aria-hidden="true"/>
    </Link>
          <button ref={menuButtonRef} type="button" aria-label="Abrir menu" aria-expanded={isMenuOpen} aria-controls="mobile-navigation" onClick={() => setIsMenuOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 md:hidden">
            <Menu size={25} aria-hidden="true"/>
          </button>
        </nav>
      </header>

      {isMenuOpen && (<div id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Menu de navegação" className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-8">
            <span className="inline-flex items-center gap-2 text-2xl font-bold text-slate-900">
              <CarFront size={27} className={styles.logoIcon} aria-hidden="true"/>
              syncar.
            </span>
            <button ref={closeButtonRef} type="button" aria-label="Fechar menu" onClick={() => { setIsMenuOpen(false); menuButtonRef.current?.focus(); }} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">
              <X size={25} aria-hidden="true"/>
            </button>
          </div>
          <nav aria-label="Navegação móvel" className="flex flex-col gap-2 px-5 py-8 sm:px-8">
            {navLinks.map((link) => (<a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="flex min-h-12 items-center rounded-lg px-3 text-lg font-semibold text-blue-950 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">
                {link.label}
              </a>))}
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="mt-5 flex min-h-12 items-center justify-center rounded-lg bg-blue-700 px-5 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">
              Acessar plataforma
            </Link>
          </nav>
        </div>)}
    </>);
}
