import { X } from 'lucide-react';
import type { PropsWithChildren } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
}

/**
 * Modal genérico. Se usa como base para todos los formularios
 * de creación/edición del sistema (Clientes, Equipos, Reparaciones, ...).
 */
export default function Modal({ open, onClose, title, children }: PropsWithChildren<ModalProps>) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-graphite-950/60" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-graphite-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
