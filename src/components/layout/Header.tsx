"use client";

import { useSession, signOut } from "next-auth/react";
import {
  LogOut,
  User as UserIcon,
  Menu as MenuIcon,
  Bell,
  CheckCheck,
  FileText,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import Link from "next/link";
import { Notification } from "@/types";

const NotificationIcon = ({ type }: { type: string }) => {
  const iconProps = { size: 18, className: "text-gray-500" };

  switch (type) {
    case "CONTRACT_ENDING":
      return <FileText {...iconProps} />;
    case "PAYMENT_OVERDUE":
      return <DollarSign {...iconProps} />;
    default:
      return <Bell {...iconProps} />;
  }
};

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { data: session } = useSession();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const getNotificationLink = (notification: Notification) => {
    if (notification.type === "CONTRACT_ENDING") {
      return `/dashboard/contracts/${notification.relatedEntityId}`;
    }
    if (notification.type === "PAYMENT_OVERDUE") {
      return `/dashboard/contracts/${notification.relatedEntityId}`;
    }
    return "#";
  };

  return (
    <header className="bg-white h-16 flex justify-between items-center px-6 border-b border-gray-200 sticky top-0 z-20">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-600"
        title="Abrir menu"
      >
        <MenuIcon size={24} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        {/* Notifications Menu */}
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
              )}
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-80 md:w-96 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-4 py-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-gray-900">
                    Notificações
                  </p>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>
              </div>
              <div className="py-1 max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification: Notification) => (
                    <Menu.Item key={notification.id}>
                      {({ active }) => (
                        <Link
                          href={getNotificationLink(notification)}
                          onClick={() => markAsRead(notification.id)}
                          className={`${
                            active ? "bg-gray-100" : ""
                          } flex items-start gap-3 px-4 py-3 text-sm text-gray-700`}
                        >
                          <div className="mt-0.5">
                            <NotificationIcon type={notification.type} />
                          </div>
                          <div className="flex-1">
                            {notification.message}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(
                                notification.createdAt
                              ).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "long",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </Link>
                      )}
                    </Menu.Item>
                  ))
                ) : (
                  <div className="px-4 py-5 text-center">
                    <div className="flex flex-col items-center text-center">
                      <CheckCheck size={32} className="text-green-500 mb-2" />
                      <p className="text-sm font-semibold text-gray-700">
                        Tudo em dia!
                      </p>
                      <p className="text-xs text-gray-500">
                        Você não tem novas notificações.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-1 py-1 border-t border-gray-100">
                <Menu.Item>
                  <Link
                    href="/dashboard/notifications"
                    className="block w-full text-center rounded-md px-2 py-2 text-sm font-medium text-blue-600 hover:bg-gray-100"
                  >
                    Ver todas as notificações
                  </Link>
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>

        {/* User Menu */}
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm text-gray-800">
                  {session?.user?.name || "Usuário"}
                </p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Avatar"
                    width={40}
                    height={40}
                  />
                ) : (
                  <UserIcon className="text-gray-500" size={24} />
                )}
              </div>
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-1 py-1 "></div>
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className={`${
                        active ? "bg-red-500 text-white" : "text-gray-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      <LogOut className="mr-2 h-5 w-5" aria-hidden="true" />
                      Sair
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
};

export default Header;
