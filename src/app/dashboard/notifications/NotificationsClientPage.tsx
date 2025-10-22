"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  FileText,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

import { Notification } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const NotificationIcon = ({
  type,
  isRead,
}: {
  type: string;
  isRead: boolean;
}) => {
  const iconProps = {
    size: 18,
    className: isRead ? "text-gray-500" : "text-blue-600",
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

interface NotificationsClientPageProps {
  initialData: {
    notifications: Notification[];
    unreadCount: number;
    total: number;
  };
}

export default function NotificationsClientPage({
  initialData,
}: NotificationsClientPageProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, error, mutate, isLoading } = useSWR(
    `/api/notifications?page=${page}&limit=${limit}`,
    fetcher,
    {
      fallbackData: page === 1 ? initialData : undefined,
      keepPreviousData: true, // Mantém os dados antigos enquanto novos são carregados
    }
  );

  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await fetch("/api/notifications/read-all", { method: "PUT" });
      mutate(); // Re-fetch data
    } catch (err) {
      console.error(err);
    }
    setIsMarkingAll(false);
  };

  const getNotificationLink = (notification: Notification) => {
    if (
      notification.type === "CONTRACT_ENDING" ||
      notification.type === "PAYMENT_OVERDUE"
    ) {
      return `/dashboard/contracts/${notification.relatedEntityId}`;
    }
    return "#";
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  if (error)
    return <div className="text-red-500">Falha ao carregar notificações.</div>;

  const notifications = data?.notifications || [];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Bell />
          Central de notificações
        </h1>
        <button
          onClick={handleMarkAllAsRead}
          disabled={isMarkingAll || data?.unreadCount === 0}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {isMarkingAll ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <CheckCheck className="h-4 w-4" />
          )}
          Marcar todas como lidas
        </button>
      </div>

      <div className={`space-y-4 ${isLoading ? "opacity-50" : ""}`}>
        {notifications.length > 0 ? (
          notifications.map((notification: Notification) => (
            <Link
              href={getNotificationLink(notification)}
              key={notification.id}
            >
              <div
                className={`p-4 rounded-lg flex items-start gap-4 transition-colors ${
                  notification.isRead
                    ? "bg-gray-50 hover:bg-gray-100"
                    : "bg-blue-50 hover:bg-blue-100 border border-blue-200"
                }`}
              >
                <div
                  className={`mt-1 p-2 rounded-full ${
                    notification.isRead ? "bg-gray-200" : "bg-blue-200"
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
                      notification.isRead
                        ? "text-gray-600"
                        : "text-gray-900 font-semibold"
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {!notification.isRead && (
                  <div
                    className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2"
                    title="Não lida"
                  ></div>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Check size={40} className="mx-auto mb-2 text-green-500" />
            <h3 className="text-lg font-semibold">Tudo certo!</h3>
            <p>Você não tem nenhuma notificação no seu histórico.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Mostrando {notifications.length} de {data?.total || 0} notificações.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}
