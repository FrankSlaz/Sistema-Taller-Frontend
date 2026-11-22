import { useEffect, useState, type FormEvent } from 'react';
import Modal from './Modal';

interface MotivoDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Confirmación que exige escribir un motivo (anular un pago, anular una
 * entrega…). El motivo queda registrado para auditoría.
 */
export default function MotivoDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  isLoading,
  error,
}: MotivoDialogProps) {
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    if (open) setMotivo('');
  }, [open]);

  const valido = motivo.trim().length >= 5;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (valido) onConfirm(motivo.trim());
  }

  return (
    <Modal open={open} onClose={isLoading ? () => undefined : onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-graphite-600">{description}</p>
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Motivo <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            autoFocus
            value={motivo}
            maxLength={255}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej. Pago registrado dos veces por error"
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
          <p className="mt-1 text-xs text-graphite-400">Queda registrado junto con tu nombre y la fecha.</p>
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-md px-4 py-2 text-sm font-medium text-graphite-600 hover:bg-graphite-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!valido || isLoading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
