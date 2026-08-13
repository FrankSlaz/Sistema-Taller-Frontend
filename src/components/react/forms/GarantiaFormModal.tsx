import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import OrdenSelect from './OrdenSelect';
import { useGarantiaMutations } from '../../../lib/hooks/useGarantias';
import { ApiError } from '../../../lib/api/client';

interface GarantiaFormModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GarantiaFormModal({ open, onClose }: GarantiaFormModalProps) {
  const { create } = useGarantiaMutations();
  const [ordenId, setOrdenId] = useState<number>(0);
  const [ordenLabel, setOrdenLabel] = useState('');
  const [dias, setDias] = useState(30);
  const [descripcion, setDescripcion] = useState('');
  const [condiciones, setCondiciones] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setOrdenId(0);
    setOrdenLabel('');
    setDias(30);
    setDescripcion('');
    setCondiciones('');
    setTouched(false);
    create.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!ordenId) return;

    create.mutate(
      { ordenId, dias, descripcion: descripcion || undefined, condiciones: condiciones || undefined },
      { onSuccess: onClose },
    );
  }

  const errorMessage =
    create.error instanceof ApiError ? create.error.message : create.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title="Registrar garantía">
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
            La orden debe tener una entrega registrada; si no la tiene, el backend rechazará la solicitud.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Días de garantía</label>
          <input
            type="number"
            min={1}
            required
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Descripción</label>
          <textarea
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Condiciones</label>
          <textarea
            rows={2}
            value={condiciones}
            onChange={(e) => setCondiciones(e.target.value)}
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
            {create.isPending ? 'Registrando…' : 'Registrar garantía'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
