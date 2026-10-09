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
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

import { Notification } from "@/types";
import styles from "./notifications.module.css";

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
    className: isRead ? styles.readMessage : styles.iconUnread,
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
    return (
      <div className={styles.error} role="alert">
        <AlertCircle size={20} aria-hidden="true" />
        <p>Falha ao carregar notificações. Tente novamente.</p>
        <button className={styles.retry} onClick={() => void mutate()}>
          Tentar novamente
        </button>
      </div>
    );

  const notifications = data?.notifications || [];

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <div>
          <h1 className={styles.title}>Central de notificações</h1>
          <p className={styles.description}>
            Acompanhe atualizações importantes da sua operação.
          </p>
        </div>
        <Bell className={styles.introIcon} size={36} aria-hidden="true" />
        <button
          onClick={handleMarkAllAsRead}
          disabled={isMarkingAll || data?.unreadCount === 0}
          className={styles.markAll}
        >
          {isMarkingAll ? (
            <Loader2 className="animate-spin h-4 w-4" aria-hidden="true" />
          ) : (
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
          )}
          Marcar todas como lidas
        </button>
      </header>

      <section className={styles.panel} aria-label="Notificações">
        {notifications.length > 0 ? (
          <div className={`${styles.list} ${isLoading ? styles.loading : ""}`}>
            {notifications.map((notification: Notification) => (
              <Link
                href={getNotificationLink(notification)}
                key={notification.id}
                className={`${styles.notification} ${notification.isRead ? "" : styles.notificationUnread}`}
              >
                <span className={`${styles.iconTile} ${notification.isRead ? "" : styles.iconUnread}`}>
                  <NotificationIcon
                    type={notification.type}
                    isRead={notification.isRead}
                  />
                </span>
                <span className={`${styles.message} ${notification.isRead ? styles.readMessage : styles.unreadMessage}`}>
                    {notification.message}
                  <time className={styles.date} dateTime={new Date(notification.createdAt).toISOString()}>
                    {new Date(notification.createdAt).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </span>
                {!notification.isRead && (
                  <span className={styles.unreadMark} aria-label="Não lida" />
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className={`${styles.empty} ${isLoading ? styles.loading : ""}`}>
            <Check size={36} className={styles.emptyIcon} aria-hidden="true" />
            <h2 className={styles.emptyTitle}>Tudo certo!</h2>
            <p className={styles.emptyCopy}>Você não tem nenhuma notificação no seu histórico.</p>
          </div>
        )}

        <footer className={styles.footer}>
        <div>
          Mostrando {notifications.length} de {data?.total || 0} notificações.
        </div>
        <nav className={styles.pagination} aria-label="Paginação de notificações">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || isLoading}
          >
            Anterior
          </button>
          <span aria-current="page">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || isLoading}
          >
            Próximo
          </button>
        </nav>
        </footer>
      </section>
    </main>
  );
}
