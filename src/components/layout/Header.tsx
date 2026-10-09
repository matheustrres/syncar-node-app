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
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Notification } from "@/types";

const NotificationIcon = ({
  type,
  isRead,
}: {
  type: string;
  isRead: boolean;
}) => {
  const iconProps = {
    size: 18,
    className: isRead ? "text-syncar-muted" : "text-syncar-success",
  };

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
  const pathname = usePathname();
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

  const sections = [
    { path: "/dashboard/vehicles", group: "Operação", label: "Veículos" },
    { path: "/dashboard/maintenance", group: "Operação", label: "Manutenções" },
    { path: "/dashboard/drivers", group: "Operação", label: "Motoristas" },
    { path: "/dashboard/contracts", group: "Operação", label: "Contratos" },
    { path: "/dashboard/financial", group: "Gestão", label: "Financeiro" },
    { path: "/dashboard/reports", group: "Gestão", label: "Relatórios" },
    { path: "/dashboard/notifications", group: "Painel", label: "Notificações" },
    { path: "/dashboard/profile", group: "Conta", label: "Meu perfil" },
  ];
  const section = sections.find(({ path }) => pathname === path || pathname.startsWith(`${path}/`));
  const breadcrumb = section ?? { path: "/dashboard", group: "Painel", label: "Visão geral" };
  const isDetailPage = pathname !== breadcrumb.path;
  const userName = session?.user?.name?.trim() || "Usuário";
  const nameParts = userName.split(/\s+/);
  const initials = `${nameParts[0]?.[0] ?? ""}${nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : ""}`.toLocaleUpperCase("pt-BR");

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-2 border-b border-syncar-border bg-syncar-surface px-4 sm:gap-4 sm:px-6 lg:px-10">
      <button
        id="dashboard-menu-button"
        onClick={onMenuClick}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-syncar-control text-syncar-text hover:bg-syncar-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-syncar-focus lg:hidden"
        aria-label="Abrir menu de navegação"
        aria-controls="dashboard-navigation"
      >
        <MenuIcon size={24} />
      </button>

      <nav aria-label="Localização atual" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-2 text-sm sm:gap-3">
          <li className="hidden shrink-0 items-center gap-2 text-syncar-muted sm:flex sm:gap-3">
            {breadcrumb.group === "Painel" ? (
              <Link href="/dashboard" className="rounded-sm hover:text-syncar-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-syncar-focus">Painel</Link>
            ) : (
              <span>{breadcrumb.group}</span>
            )}
            <ChevronRight size={14} strokeWidth={1.8} aria-hidden="true" />
          </li>
          <li className={`min-w-0 truncate font-semibold ${isDetailPage ? "hidden text-syncar-muted sm:block" : "text-syncar-text"}`}>
            {isDetailPage ? <Link href={breadcrumb.path} className="rounded-sm hover:text-syncar-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-syncar-focus">{breadcrumb.label}</Link> : <span aria-current="page">{breadcrumb.label}</span>}
          </li>
          {isDetailPage && (
            <li className="flex min-w-0 items-center gap-2 sm:gap-3">
              <ChevronRight size={14} strokeWidth={1.8} className="hidden shrink-0 text-syncar-muted sm:block" aria-hidden="true" />
              <span aria-current="page" className="truncate font-semibold text-syncar-text">Detalhes</span>
            </li>
          )}
        </ol>
      </nav>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {/* Notifications Menu */}
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button aria-label={unreadCount > 0 ? `Notificações, ${unreadCount} não lidas` : "Notificações"} className="relative flex h-11 w-11 items-center justify-center rounded-syncar-control border border-syncar-border text-syncar-muted hover:bg-syncar-subtle hover:text-syncar-text focus:outline-none focus-visible:ring-2 focus-visible:ring-syncar-focus">
              <Bell size={20} aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 block h-2 w-2 rounded-full bg-syncar-danger" />
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
            <Menu.Items className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] origin-top-right rounded-syncar-panel border border-syncar-border bg-syncar-surface shadow-syncar-overlay focus:outline-none">
              <div className="px-4 py-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-syncar-text">
                    Notificações
                  </p>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-xs font-semibold text-syncar-success hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-syncar-focus"
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
                            active ? "bg-syncar-subtle" : ""
                          } flex items-start gap-3 px-4 py-3 text-sm`}
                        >
                          <div
                            className={`mt-0.5 p-1 rounded-full ${
                              !notification.isRead
                                ? "bg-syncar-subtle"
                                : "bg-syncar-canvas"
                            }`}
                          >
                            <NotificationIcon
                              type={notification.type}
                              isRead={notification.isRead}
                            />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm ${
                                !notification.isRead
                                  ? "font-semibold text-syncar-text"
                                  : "text-syncar-muted"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-syncar-muted mt-1">
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
                          {!notification.isRead && (
                            <div
                              className="w-2 h-2 bg-syncar-success rounded-full mt-1.5"
                              title="Não lida"
                            ></div>
                          )}
                        </Link>
                      )}
                    </Menu.Item>
                  ))
                ) : (
                  <div className="px-4 py-5 text-center">
                    <div className="flex flex-col items-center text-center">
                      <CheckCheck size={32} className="text-syncar-success mb-2" />
                      <p className="text-sm font-semibold text-syncar-text">
                        Tudo em dia!
                      </p>
                      <p className="text-xs text-syncar-muted">
                        Você não tem novas notificações.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-1 py-1 border-t border-syncar-border">
                <Menu.Item>
                  <Link
                    href="/dashboard/notifications"
                    className="block w-full rounded-syncar-control px-2 py-3 text-center text-sm font-semibold text-syncar-success hover:bg-syncar-subtle"
                  >
                    Ver todas as notificações
                  </Link>
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>

        <span className="h-9 w-px bg-syncar-border" aria-hidden="true" />

        {/* User Menu */}
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button aria-label={`Menu da conta: ${userName}`} className="flex min-h-11 items-center gap-3 rounded-syncar-control pl-1 hover:bg-syncar-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-syncar-focus sm:px-1">
              <span className="hidden max-w-40 truncate text-sm font-semibold text-syncar-text sm:block lg:max-w-48">{userName}</span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-syncar-subtle text-xs font-semibold text-syncar-brand">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt=""
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </span>
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
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-syncar-panel border border-syncar-border bg-syncar-surface p-1 shadow-syncar-overlay focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <Link href="/dashboard/profile" className={`${active ? "bg-syncar-subtle" : ""} flex min-h-11 items-center rounded-syncar-control px-3 text-sm font-medium text-syncar-text`}>
                    <UserIcon className="mr-2 h-4 w-4" aria-hidden="true" />Meu perfil
                  </Link>
                )}
              </Menu.Item>
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className={`${
                        active ? "bg-syncar-subtle" : ""
                      } group flex min-h-11 w-full items-center rounded-syncar-control px-3 text-sm font-medium text-syncar-danger`}
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
