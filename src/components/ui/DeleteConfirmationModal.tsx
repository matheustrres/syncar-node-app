'use client';

import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  resourceName: string;
  resourceIdentifier?: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  resourceName,
  resourceIdentifier,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Excluir ${resourceName}`}
      size="md"
    >
      <div className="text-center p-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="text-lg font-medium text-gray-900 mt-3">
          Excluir {resourceName}
        </h3>
        <div className="mt-2 px-7 py-3">
          <p className="text-sm text-gray-500">
            Você tem certeza que deseja excluir {' '}
            {resourceIdentifier && <span className="font-bold">{resourceIdentifier}</span>}?
            Esta ação não poderá ser desfeita.
          </p>
        </div>
        <div className="items-center px-4 py-3 gap-4 flex justify-center">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50"
          >
            {isDeleting ? 'Excluindo...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
