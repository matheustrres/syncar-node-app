"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  Users,
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: TrendingUp, label: "Dashboard" },
  { href: "/dashboard/vehicles", icon: Car, label: "Veículos" },
  { href: "/dashboard/drivers", icon: Users, label: "Motoristas" },
  { href: "/dashboard/contracts", icon: FileText, label: "Contratos" },
  { href: "/dashboard/financial", icon: DollarSign, label: "Financeiro" },
  { href: "/dashboard/reports", icon: Calendar, label: "Relatórios" },
  { href: "/dashboard/profile", icon: Settings, label: "Meu perfil" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay para fechar no mobile */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white flex flex-col z-40
                    transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 border-r border-gray-200 ${
                      isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
      >
        <div className="flex items-center h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Car className="text-blue-600" size={28} />
            <span className="text-2xl font-bold text-gray-800">Syncar</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul>
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
