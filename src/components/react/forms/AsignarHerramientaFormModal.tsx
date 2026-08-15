import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import UsuarioSelect from './UsuarioSelect';
import { useHerramientaMutations } from '../../../lib/hooks/useHerramientas';
import { ApiError } from '../../../lib/api/client';
import type { Herramienta } from '../../../types/herramienta';

interface AsignarHerramientaFormModalProps {
  open: boolean;
  onClose: () => void;
  herramienta: Herramienta | null;
}

export default function AsignarHerramientaFormModal({
  open,
  onClose,
  herramienta,
}: AsignarHerramientaFormModalProps) {
  const { asignar } = useHerramientaMutations(herramienta?.id);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setUsuarioId(null);
    setObservaciones('');
    setTouched(false);
    asignar.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, herramienta]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!usuarioId) return;

    asignar.mutate({ usuarioId, observaciones: observaciones || undefined }, { onSuccess: onClose });
  }

  const errorMessage =
    asignar.error instanceof ApiError ? asignar.error.message : asignar.error ? 'Error inesperado' : null;

  if (!herramienta) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Asignar "${herramienta.nombre}"`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Asignar a <span className="text-red-500">*</span>
          </label>
          <UsuarioSelect
            value={usuarioId}
            onChange={(id) => setUsuarioId(id)}
            error={touched && !usuarioId ? 'Selecciona un usuario' : undefined}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Observaciones</label>
          <textarea
            rows={2}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-graphite-600 hover:bg-graphite-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={asignar.isPending}
            className="rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
          >
            {asignar.isPending ? 'Asignando…' : 'Asignar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
