import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useNotifications() {
  const { data, error, mutate } = useSWR(
    `/api/notifications?limit=2&summary=true`,
    fetcher,
    {
      refreshInterval: 60000, // Re-fetch a cada 60 segundos
    }
  );
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
      });
      // Revalida os dados para atualizar a UI
      mutate();
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };
  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", {
        method: "PUT",
      });
      mutate();
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
    }
  };
  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    isLoading: !error && !data,
    isError: error,
    markAsRead,
    markAllAsRead,
  };
}
