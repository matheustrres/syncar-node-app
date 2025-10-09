"use client";

import Link from "next/link";
import { Car } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Car className="text-blue-600" size={28} />
          <span className="text-2xl font-bold text-gray-800">Syncar</span>
        </Link>

        {/* Ação Principal Única */}
        <Link
          href="/login"
          className="bg-blue-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Acessar Plataforma
        </Link>
      </nav>
    </header>
  );
}
