"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User as UserIcon, Menu } from "lucide-react";
import Image from "next/image";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm h-16 flex justify-between lg:justify-end items-center px-6 z-10 relative">
      {/* Botão Hambúrguer - Visível apenas em telas pequenas (abaixo de lg) */}
      <button onClick={onMenuClick} className="lg:hidden text-gray-600">
        <Menu size={24} />
      </button>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold text-sm text-gray-800">
            {session?.user?.name || "Usuário"}
          </p>
          <p className="text-xs text-gray-500">{session?.user?.email}</p>
        </div>

        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt="Avatar do usuário"
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <UserIcon className="text-gray-500" size={24} />
          )}
        </div>

        <div className="h-8 w-px bg-gray-200" />

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Sair"
          className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
