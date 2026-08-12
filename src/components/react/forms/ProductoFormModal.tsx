import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import { useProductoMutations } from '../../../lib/hooks/useProductos';
import { useCategorias } from '../../../lib/hooks/useCategorias';
import { ApiError } from '../../../lib/api/client';
import type { CreateProductoPayload, Producto } from '../../../types/producto';

interface ProductoFormModalProps {
  open: boolean;
  onClose: () => void;
  producto?: Producto | null;
  onManageCategorias?: () => void;
  /** Precarga el nombre (ej. el término que se buscó en un combobox). */
  initialNombre?: string;
  /**
   * Oculta el campo de stock inicial y fuerza stockActual: 0. Se usa
   * al crear un producto desde dentro de Compras: el stock real lo
   * establece la propia compra vía su movimiento ENTRADA automático,
   * así que arrancar en 0 evita una diferencia de stock falsa.
   */
  lockStockZero?: boolean;
  /** Se llama con el producto recién creado (solo en modo alta). */
  onCreated?: (producto: Producto) => void;
}

const emptyForm: CreateProductoPayload = {
  categoriaId: 0,
  codigo: '',
  nombre: '',
  descripcion: '',
  marca: '',
  modeloCompatible: '',
  precioCompra: 0,
  precioReferencia: 0,
  stockActual: 0,
  stockMinimo: 0,
  estado: true,
};

export default function ProductoFormModal({
  open,
  onClose,
  producto,
  onManageCategorias,
  initialNombre,
  lockStockZero = false,
  onCreated,
}: ProductoFormModalProps) {
  const isEdit = !!producto;
  const { data: categorias } = useCategorias();
  const { create, update } = useProductoMutations();
  const [form, setForm] = useState<CreateProductoPayload>(emptyForm);
  const [touched, setTouched] = useState(false);

  const mutation = isEdit ? update : create;

  useEffect(() => {
    if (!open) return;
    setForm(
      producto
        ? {
            categoriaId: producto.categoriaId,
            codigo: producto.codigo ?? '',
            nombre: producto.nombre,
            descripcion: producto.descripcion ?? '',
            marca: producto.marca ?? '',
            modeloCompatible: producto.modeloCompatible ?? '',
            precioCompra: Number(producto.precioCompra ?? 0),
            precioReferencia: Number(producto.precioReferencia ?? 0),
            stockMinimo: producto.stockMinimo ?? 0,
            estado: producto.estado ?? true,
          }
        : { ...emptyForm, nombre: initialNombre ?? '' },
    );
    setTouched(false);
    mutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, producto]);

  function set<K extends keyof CreateProductoPayload>(key: K, value: CreateProductoPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);

    if (!form.categoriaId || !form.nombre.trim()) return;

    const base = {
      categoriaId: form.categoriaId,
      codigo: form.codigo || undefined,
      nombre: form.nombre,
      descripcion: form.descripcion || undefined,
      marca: form.marca || undefined,
      modeloCompatible: form.modeloCompatible || undefined,
      precioCompra: form.precioCompra,
      precioReferencia: form.precioReferencia,
      stockMinimo: form.stockMinimo,
      estado: form.estado,
    };

    if (isEdit && producto) {
      update.mutate({ id: producto.id, payload: base }, { onSuccess: onClose });
    } else {
      create.mutate(
        { ...base, stockActual: lockStockZero ? 0 : form.stockActual },
        {
          onSuccess: (creado) => {
            onCreated?.(creado);
            onClose();
          },
        },
      );
    }
  }

  const errorMessage =
    mutation.error instanceof ApiError ? mutation.error.message : mutation.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar producto' : 'Nuevo producto'}>
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-graphite-900">
              Categoría <span className="text-red-500">*</span>
            </label>
            {onManageCategorias && (
              <button
                type="button"
                onClick={onManageCategorias}
                className="text-xs font-medium text-graphite-500 hover:text-graphite-900 hover:underline"
              >
                Gestionar categorías
              </button>
            )}
          </div>
          <select
            value={form.categoriaId}
            onChange={(e) => set('categoriaId', Number(e.target.value))}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          >
            <option value={0} disabled>
              Selecciona una categoría…
            </option>
            {categorias?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          {touched && !form.categoriaId && <p className="mt-1 text-xs text-red-600">Selecciona una categoría</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={form.nombre}
              onChange={(e) => set('nombre', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Código</label>
            <input
              type="text"
              maxLength={50}
              value={form.codigo}
              onChange={(e) => set('codigo', e.target.value)}
              placeholder="Único, opcional"
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Marca</label>
            <input
              type="text"
              value={form.marca}
              onChange={(e) => set('marca', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Modelo compatible</label>
            <input
              type="text"
              value={form.modeloCompatible}
              onChange={(e) => set('modeloCompatible', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Descripción</label>
          <textarea
            rows={2}
            value={form.descripcion}
            onChange={(e) => set('descripcion', e.target.value)}
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Precio de compra</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.precioCompra}
              onChange={(e) => set('precioCompra', Number(e.target.value))}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Precio de referencia</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.precioReferencia}
              onChange={(e) => set('precioReferencia', Number(e.target.value))}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">
              Stock inicial
              {(isEdit || lockStockZero) && (
                <span className="ml-1 text-xs font-normal text-graphite-400">(no editable aquí)</span>
              )}
            </label>
            {isEdit ? (
              <p className="rounded-md border border-graphite-100 bg-graphite-50 px-3 py-2 text-sm text-graphite-600">
                {producto?.stockActual} unidades — usa "Registrar movimiento" para cambiarlo
              </p>
            ) : lockStockZero ? (
              <p className="rounded-md border border-graphite-100 bg-graphite-50 px-3 py-2 text-sm text-graphite-600">
                0 unidades — esta compra registrará el stock real al confirmarse
              </p>
            ) : (
              <input
                type="number"
                min={0}
                value={form.stockActual}
                onChange={(e) => set('stockActual', Number(e.target.value))}
                className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
              />
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Stock mínimo</label>
            <input
              type="number"
              min={0}
              value={form.stockMinimo}
              onChange={(e) => set('stockMinimo', Number(e.target.value))}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        {isEdit && (
          <label className="flex items-center gap-2 text-sm text-graphite-900">
            <input
              type="checkbox"
              checked={!!form.estado}
              onChange={(e) => set('estado', e.target.checked)}
              className="rounded border-graphite-300"
            />
            Producto activo
          </label>
        )}

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
            disabled={mutation.isPending}
            className="rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
          >
            {mutation.isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
