import { getAllNotifications } from "@/lib/data-access";
import NotificationsClientPage from "./NotificationsClientPage";

export default async function NotificationsPage() {
  const initialData = await getAllNotifications();
  return <NotificationsClientPage initialData={initialData} />;
}
