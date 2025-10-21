import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("An error occurred while fetching the data.");
    }
    return res.json();
  });

interface BaseItem {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function useCrud<T extends BaseItem>(apiPath: string) {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR<T[]>(apiPath, fetcher);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  const handleOpenFormModal = (item: T | null = null) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setEditingItem(null);
    setIsFormModalOpen(false);
  };

  const handleSave = async (
    formData: Omit<T, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `${apiPath}/${editingItem.id}` : apiPath;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    handleCloseFormModal();
    mutate();
  };

  const handleDeleteClick = (item: T) => {
    setItemToDelete(item);
  };

  const handleCloseDeleteModal = () => {
    setItemToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await fetch(`${apiPath}/${itemToDelete.id}`, { method: "DELETE" });
      setItemToDelete(null);
      mutate();
    }
  };

  const deleteMany = async (ids: string[]) => {
    await fetch(apiPath, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
  };

  const handleRowClick = (itemId: string) => {
    const resourceName = apiPath.split("/")[2];
    router.push(`/dashboard/${resourceName}/${itemId}`);
  };

  return {
    data: data,
    loading: isLoading,
    error,
    isFormModalOpen,
    editingItem,
    itemToDelete,
    deleteMany,
    handleOpenFormModal,
    handleCloseFormModal,
    handleSave,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleRowClick,
  };
}
