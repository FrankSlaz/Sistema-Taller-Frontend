import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import ProductoSelect from './ProductoSelect';
import { useMovimientoMutations } from '../../../lib/hooks/useMovimientos';
import { ApiError } from '../../../lib/api/client';
import { TIPOS_MOVIMIENTO, type CreateMovimientoPayload, type TipoMovimiento } from '../../../types/movimiento';

interface MovimientoFormModalProps {
  open: boolean;
  onClose: () => void;
  defaultProductoId?: number;
  defaultProductoLabel?: string;
  defaultStockActual?: number;
  /** Si es true, el producto no se puede cambiar (acción rápida desde una fila). */
  lockProducto?: boolean;
}

const TIPO_HELP: Record<TipoMovimiento, string> = {
  ENTRADA: 'Cantidad a sumar al stock actual.',
  SALIDA: 'Cantidad a restar del stock actual (debe haber suficiente disponible).',
  AJUSTE: 'Nuevo valor exacto de stock (reemplaza el actual, puede ser 0).',
};

export default function MovimientoFormModal({
  open,
  onClose,
  defaultProductoId,
  defaultProductoLabel,
  defaultStockActual,
  lockProducto = false,
}: MovimientoFormModalProps) {
  const { registrar } = useMovimientoMutations();
  const [productoId, setProductoId] = useState<number>(0);
  const [productoLabel, setProductoLabel] = useState('');
  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimiento>('ENTRADA');
  const [cantidad, setCantidad] = useState<number>(0);
  const [motivo, setMotivo] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setProductoId(defaultProductoId ?? 0);
    setProductoLabel(defaultProductoLabel ?? '');
    setTipoMovimiento('ENTRADA');
    setCantidad(0);
    setMotivo('');
    setTouched(false);
    registrar.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultProductoId]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);

    if (!productoId) return;

    const payload: CreateMovimientoPayload = {
      productoId,
      tipoMovimiento,
      cantidad,
      motivo: motivo || undefined,
    };

    registrar.mutate(payload, { onSuccess: onClose });
  }

  const errorMessage =
    registrar.error instanceof ApiError ? registrar.error.message : registrar.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title="Registrar movimiento de inventario">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Producto <span className="text-red-500">*</span>
          </label>
          {lockProducto ? (
            <p className="rounded-md border border-graphite-100 bg-graphite-50 px-3 py-2 text-sm text-graphite-600">
              {productoLabel} — stock actual: {defaultStockActual ?? '—'}
            </p>
          ) : (
            <ProductoSelect
              value={productoId || null}
              initialLabel={productoLabel}
              onChange={(id, label) => {
                setProductoId(id);
                setProductoLabel(label);
              }}
              error={touched && !productoId ? 'Selecciona un producto' : undefined}
            />
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Tipo de movimiento</label>
          <div className="grid grid-cols-3 gap-2">
            {TIPOS_MOVIMIENTO.map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setTipoMovimiento(tipo)}
                className={`rounded-md border px-3 py-2 text-sm font-medium ${
                  tipoMovimiento === tipo
                    ? 'border-graphite-800 bg-graphite-900 text-white'
                    : 'border-graphite-200 text-graphite-700 hover:bg-graphite-50'
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-graphite-400">{TIPO_HELP[tipoMovimiento]}</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            {tipoMovimiento === 'AJUSTE' ? 'Nuevo stock' : 'Cantidad'} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min={0}
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Motivo (opcional)</label>
          <textarea
            rows={2}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej. Compra a proveedor, uso en orden #123, conteo físico…"
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
            disabled={registrar.isPending}
            className="rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
          >
            {registrar.isPending ? 'Registrando…' : 'Registrar movimiento'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
