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
        <AlertTriangle className="mx-auto h-12 w-12 text-syncar-danger" aria-hidden="true" />
        <h3 className="mt-3 text-lg font-semibold text-syncar-text">
          Excluir {resourceName}
        </h3>
        <div className="mt-2 px-7 py-3">
          <p className="text-sm leading-6 text-syncar-muted">
            Você tem certeza que deseja excluir {' '}
            {resourceIdentifier && <span className="font-bold">{resourceIdentifier}</span>}?
            Esta ação não poderá ser desfeita.
          </p>
        </div>
        <div className="items-center px-4 py-3 gap-4 flex justify-center">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="min-h-11 rounded-syncar-control border border-syncar-border bg-syncar-surface px-6 py-2 font-semibold text-syncar-text hover:bg-syncar-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-syncar-focus disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="min-h-11 rounded-syncar-control bg-syncar-danger px-6 py-2 font-semibold text-white hover:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-focus disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? 'Excluindo...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
