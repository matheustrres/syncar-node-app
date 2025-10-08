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
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: TrendingUp, label: "Dashboard" },
  { href: "/dashboard/vehicles", icon: Car, label: "Veículos" },
  { href: "/dashboard/drivers", icon: Users, label: "Motoristas" },
  { href: "/dashboard/contracts", icon: FileText, label: "Contratos" },
  { href: "/dashboard/financial", icon: DollarSign, label: "Financeiro" },
  { href: "/dashboard/reports", icon: Calendar, label: "Relatórios" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white text-gray-800 flex-col p-4 shadow-lg z-30
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:shadow-none lg:flex ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600 p-4">Syncar</h1>
          <button onClick={onClose} className="lg:hidden p-2">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1">
          <ul>
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
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
