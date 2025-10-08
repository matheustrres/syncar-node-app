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
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: TrendingUp, label: "Dashboard" },
  { href: "/dashboard/vehicles", icon: Car, label: "Veículos" },
  { href: "/dashboard/drivers", icon: Users, label: "Motoristas" },
  { href: "/dashboard/contracts", icon: FileText, label: "Contratos" },
  { href: "/dashboard/financial", icon: DollarSign, label: "Financeiro" },
  { href: "/dashboard/reports", icon: Calendar, label: "Relatórios" },
];

const Sidebar = () => {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-white text-gray-800 flex flex-col p-4 shadow-lg">
      <div className="text-2xl font-bold text-blue-600 mb-8 p-4">
        Syncar
      </div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-200"
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
  );
};

export default Sidebar;
