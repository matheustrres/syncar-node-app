'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Car, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Fecha o menu em mudança de rota
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Desabilita o scroll do body quando o menu está aberto
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Função de limpeza
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: '#features', label: 'Funcionalidades' },
    { href: '#pricing', label: 'Planos' },
    { href: '#preview', label: 'Demonstração' },
  ];

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Car className="text-blue-600" size={28} />
            <span className="text-2xl font-bold text-gray-800">Syncar</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/login"
              className="bg-blue-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Acessar Plataforma
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center border-b border-gray-200">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Car className="text-blue-600" size={28} />
            <span className="text-2xl font-bold text-gray-800">Syncar</span>
          </Link>
          <button
            onClick={() => setIsMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center h-[calc(100%-80px)] gap-8 -mt-10">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-2xl text-gray-800 hover:text-blue-600 transition-colors font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="bg-blue-600 text-white font-semibold text-center mt-6 px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Acessar Plataforma
          </Link>
        </div>
      </div>
    </>
  );
}