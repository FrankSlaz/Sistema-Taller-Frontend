import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import OrdenSelect from './OrdenSelect';
import { usePagoMutations } from '../../../lib/hooks/usePagos';
import { ApiError } from '../../../lib/api/client';
import { METODOS_PAGO, type MetodoPago } from '../../../types/pago';

interface PagoFormModalProps {
  open: boolean;
  onClose: () => void;
  defaultOrdenId?: number;
  defaultOrdenLabel?: string;
}

export default function PagoFormModal({ open, onClose, defaultOrdenId, defaultOrdenLabel }: PagoFormModalProps) {
  const { create } = usePagoMutations(defaultOrdenId);
  const [ordenId, setOrdenId] = useState(0);
  const [ordenLabel, setOrdenLabel] = useState('');
  const [monto, setMonto] = useState(0);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [referencia, setReferencia] = useState('');
  const [observacion, setObservacion] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setOrdenId(defaultOrdenId ?? 0);
    setOrdenLabel(defaultOrdenLabel ?? '');
    setMonto(0);
    setMetodoPago('EFECTIVO');
    setReferencia('');
    setObservacion('');
    setTouched(false);
    create.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultOrdenId]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!ordenId || monto <= 0) return;

    create.mutate(
      { ordenId, monto, metodoPago, referencia: referencia || undefined, observacion: observacion || undefined },
      { onSuccess: onClose },
    );
  }

  const errorMessage =
    create.error instanceof ApiError ? create.error.message : create.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title="Registrar pago">
      <form onSubmit={handleSubmit} className="space-y-4">
        {defaultOrdenId ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Orden</label>
            <p className="rounded-md border border-graphite-100 bg-graphite-50 px-3 py-2 text-sm text-graphite-600">
              {ordenLabel || `Orden #${ordenId}`}
            </p>
          </div>
        ) : (
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
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">
              Monto <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={0.01}
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
            {touched && monto <= 0 && <p className="mt-1 text-xs text-red-600">El monto debe ser mayor a 0</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Método de pago</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            >
              {METODOS_PAGO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Referencia</label>
          <input
            type="text"
            maxLength={100}
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            placeholder="Ej. N.º de comprobante, últimos 4 dígitos de la tarjeta…"
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Observación</label>
          <textarea
            rows={2}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
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
            {create.isPending ? 'Registrando…' : 'Registrar pago'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
