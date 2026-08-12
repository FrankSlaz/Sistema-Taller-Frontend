import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import ProductoSelect from './ProductoSelect';
import ProductoFormModal from './ProductoFormModal';
import { useProveedores } from '../../../lib/hooks/useProveedores';
import { useCompraMutations } from '../../../lib/hooks/useCompras';
import { ApiError } from '../../../lib/api/client';
import type { Producto } from '../../../types/producto';

interface CompraFormModalProps {
  open: boolean;
  onClose: () => void;
}

interface DetalleRow {
  key: string;
  productoId: number;
  productoLabel: string;
  cantidad: number;
  precioUnitario: number;
}

function nuevaFila(): DetalleRow {
  return { key: crypto.randomUUID(), productoId: 0, productoLabel: '', cantidad: 1, precioUnitario: 0 };
}

function formatMonto(value: number) {
  return `Bs ${value.toFixed(2)}`;
}

export default function CompraFormModal({ open, onClose }: CompraFormModalProps) {
  const { data: proveedores } = useProveedores();
  const { create } = useCompraMutations();

  const [proveedorId, setProveedorId] = useState<number | ''>('');
  const [numeroCompra, setNumeroCompra] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [detalles, setDetalles] = useState<DetalleRow[]>([nuevaFila()]);
  const [touched, setTouched] = useState(false);
  const [creatingFor, setCreatingFor] = useState<{ rowKey: string; nombre: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setProveedorId('');
    setNumeroCompra('');
    setObservaciones('');
    setDetalles([nuevaFila()]);
    setTouched(false);
    setCreatingFor(null);
    create.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const total = useMemo(
    () => detalles.reduce((acc, d) => acc + d.cantidad * d.precioUnitario, 0),
    [detalles],
  );

  const detallesValidos = detalles.every((d) => d.productoId && d.cantidad > 0 && d.precioUnitario >= 0);

  function updateRow(key: string, patch: Partial<DetalleRow>) {
    setDetalles((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setDetalles((prev) => [...prev, nuevaFila()]);
  }

  function removeRow(key: string) {
    setDetalles((prev) => (prev.length > 1 ? prev.filter((row) => row.key !== key) : prev));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);

    if (!detallesValidos) return;

    create.mutate(
      {
        proveedorId: proveedorId || undefined,
        numeroCompra: numeroCompra || undefined,
        observaciones: observaciones || undefined,
        detalles: detalles.map((d) => ({
          productoId: d.productoId,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
        })),
      },
      { onSuccess: onClose },
    );
  }

  const errorMessage =
    create.error instanceof ApiError ? create.error.message : create.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title="Registrar compra">
      <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Proveedor</label>
            <select
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            >
              <option value="">Sin especificar</option>
              {proveedores?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">N.º de compra / factura</label>
            <input
              type="text"
              maxLength={50}
              value={numeroCompra}
              onChange={(e) => setNumeroCompra(e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-graphite-900">
            Productos <span className="text-red-500">*</span>
          </label>

          <div className="space-y-2">
            {detalles.map((row, index) => {
              const subtotal = row.cantidad * row.precioUnitario;
              const rowError = touched && (!row.productoId || row.cantidad <= 0);

              return (
                <div key={row.key} className="rounded-md border border-graphite-100 p-3">
                  <div className="mb-2">
                    <ProductoSelect
                      value={row.productoId || null}
                      initialLabel={row.productoLabel}
                      onChange={(id, label) => updateRow(row.key, { productoId: id, productoLabel: label })}
                      onCreateNew={(term) => setCreatingFor({ rowKey: row.key, nombre: term })}
                      error={rowError && !row.productoId ? 'Selecciona un producto' : undefined}
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-graphite-500">Cantidad</label>
                      <input
                        type="number"
                        min={1}
                        value={row.cantidad}
                        onChange={(e) => updateRow(row.key, { cantidad: Number(e.target.value) })}
                        className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-graphite-500">Precio unitario</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={row.precioUnitario}
                        onChange={(e) => updateRow(row.key, { precioUnitario: Number(e.target.value) })}
                        className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
                      />
                    </div>
                    <div className="w-24 text-right text-sm text-graphite-600">{formatMonto(subtotal)}</div>
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      disabled={detalles.length === 1}
                      className="shrink-0 rounded-md p-2 text-graphite-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                      aria-label={`Quitar línea ${index + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-graphite-900 hover:underline"
          >
            <Plus size={15} />
            Agregar producto
          </button>
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

        <div className="rounded-md bg-graphite-50 px-3 py-2 text-right text-sm">
          <span className="text-graphite-500">Total: </span>
          <span className="font-semibold text-graphite-900">{formatMonto(total)}</span>
        </div>

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
        )}

        <div className="sticky bottom-0 flex justify-end gap-2 bg-white pt-2">
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
            {create.isPending ? 'Registrando…' : 'Registrar compra'}
          </button>
        </div>
      </form>

      <ProductoFormModal
        open={!!creatingFor}
        producto={null}
        initialNombre={creatingFor?.nombre}
        lockStockZero
        onClose={() => setCreatingFor(null)}
        onCreated={(creado: Producto) => {
          if (creatingFor) {
            updateRow(creatingFor.rowKey, { productoId: creado.id, productoLabel: creado.nombre });
          }
          setCreatingFor(null);
        }}
      />
    </Modal>
  );
}
