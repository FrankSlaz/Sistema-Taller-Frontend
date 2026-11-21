import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import ProductoSelect from './ProductoSelect';
import { useOrdenRepuestoMutations } from '../../../lib/hooks/useOrdenRepuestos';
import { ApiError } from '../../../lib/api/client';

interface RepuestoFormModalProps {
  open: boolean;
  onClose: () => void;
  ordenId: number;
  ordenCodigo: string;
}

const inputClass =
  'w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800';

export default function RepuestoFormModal({ open, onClose, ordenId, ordenCodigo }: RepuestoFormModalProps) {
  const { create } = useOrdenRepuestoMutations(ordenId);
  const [productoId, setProductoId] = useState(0);
  const [productoLabel, setProductoLabel] = useState('');
  const [stockDisponible, setStockDisponible] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setProductoId(0);
    setProductoLabel('');
    setStockDisponible(null);
    setCantidad(1);
    setPrecioUnitario(0);
    setTouched(false);
    create.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const excedeStock = stockDisponible !== null && cantidad > stockDisponible;
  const subtotal = cantidad * precioUnitario;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!productoId || cantidad <= 0 || precioUnitario < 0 || excedeStock) return;

    create.mutate({ ordenId, productoId, cantidad, precioUnitario }, { onSuccess: onClose });
  }

  const errorMessage =
    create.error instanceof ApiError ? create.error.message : create.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title={`Cargar repuesto · ${ordenCodigo}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Producto <span className="text-red-500">*</span>
          </label>
          <ProductoSelect
            value={productoId || null}
            initialLabel={productoLabel}
            onChange={(id, label, producto) => {
              setProductoId(id);
              setProductoLabel(label);
              setStockDisponible(producto.stockActual ?? 0);
              setPrecioUnitario(Number(producto.precioReferencia ?? 0));
            }}
            error={touched && !productoId ? 'Selecciona un producto' : undefined}
          />
          {stockDisponible !== null && (
            <p className="mt-1 text-xs text-graphite-400">Stock disponible: {stockDisponible}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">
              Cantidad <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              step={1}
              value={cantidad}
              onChange={(e) => setCantidad(Math.trunc(Number(e.target.value)))}
              className={inputClass}
            />
            {excedeStock && <p className="mt-1 text-xs text-red-600">Supera el stock disponible</p>}
            {touched && cantidad <= 0 && <p className="mt-1 text-xs text-red-600">Debe ser al menos 1</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Precio unitario (Bs)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={precioUnitario}
              onChange={(e) => setPrecioUnitario(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md bg-graphite-50 px-3 py-2 text-sm">
          <span className="text-graphite-500">Subtotal</span>
          <span className="font-semibold text-graphite-900">Bs {subtotal.toFixed(2)}</span>
        </div>

        <p className="text-xs text-graphite-400">
          Al cargarlo se descuenta del inventario y se suma al total de la orden.
        </p>

        {errorMessage && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}

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
            {create.isPending ? 'Cargando…' : 'Cargar repuesto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
