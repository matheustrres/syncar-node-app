import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface BaseItem {
  id: string;
}

export function useCrud<T extends BaseItem>(apiPath: string) {
  const router = useRouter();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath);
      if (!res.ok) throw new Error(`Falha ao buscar dados de ${apiPath}.`);
      const fetchedData = await res.json();
      setData(fetchedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [apiPath]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    await fetchData();
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
      await fetchData();
    }
  };

  const handleRowClick = (itemId: string) => {
    const resourceName = apiPath.split("/")[2];
    router.push(`/dashboard/${resourceName}/${itemId}`);
  };

  return {
    data,
    loading,
    isFormModalOpen,
    editingItem,
    itemToDelete,
    fetchData,
    handleOpenFormModal,
    handleCloseFormModal,
    handleSave,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleRowClick,
  };
}
