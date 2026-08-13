import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import OrdenSelect from './OrdenSelect';
import { useEntregaMutations } from '../../../lib/hooks/useEntregas';
import { ApiError } from '../../../lib/api/client';

interface EntregaFormModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EntregaFormModal({ open, onClose }: EntregaFormModalProps) {
  const { create } = useEntregaMutations();
  const [ordenId, setOrdenId] = useState<number>(0);
  const [ordenLabel, setOrdenLabel] = useState('');
  const [nombreRecibe, setNombreRecibe] = useState('');
  const [documentoRecibe, setDocumentoRecibe] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setOrdenId(0);
    setOrdenLabel('');
    setNombreRecibe('');
    setDocumentoRecibe('');
    setObservaciones('');
    setTouched(false);
    create.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!ordenId) return;

    create.mutate(
      {
        ordenId,
        nombreRecibe: nombreRecibe || undefined,
        documentoRecibe: documentoRecibe || undefined,
        observaciones: observaciones || undefined,
      },
      { onSuccess: onClose },
    );
  }

  const errorMessage =
    create.error instanceof ApiError ? create.error.message : create.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title="Registrar entrega">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Orden <span className="text-red-500">*</span>
          </label>
          <OrdenSelect
            value={ordenId || null}
            initialLabel={ordenLabel}
            onChange={(id, label) => {
              setOrdenId(id);
              setOrdenLabel(label);
            }}
            error={touched && !ordenId ? 'Selecciona una orden' : undefined}
          />
          <p className="mt-1 text-xs text-graphite-400">
            Al registrar la entrega, la orden pasará automáticamente a estado ENTREGADO.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Nombre de quien recibe</label>
          <input
            type="text"
            value={nombreRecibe}
            onChange={(e) => setNombreRecibe(e.target.value)}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Documento</label>
          <input
            type="text"
            value={documentoRecibe}
            onChange={(e) => setDocumentoRecibe(e.target.value)}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
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
            disabled={create.isPending}
            className="rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
          >
            {create.isPending ? 'Registrando…' : 'Registrar entrega'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
