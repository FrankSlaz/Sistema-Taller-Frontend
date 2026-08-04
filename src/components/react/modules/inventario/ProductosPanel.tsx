import { ArrowLeftRight, ListTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import SearchInput from '../../filters/SearchInput';
import Pagination from '../../ui/Pagination';
import Badge from '../../ui/Badge';
import ConfirmDialog from '../../ui/ConfirmDialog';
import ProductoFormModal from '../../forms/ProductoFormModal';
import MovimientoFormModal from '../../forms/MovimientoFormModal';
import CategoriasManagerModal from './CategoriasManagerModal';
import QueryProvider from '../../providers/QueryProvider';
import { useProductoMutations, useProductos } from '../../../../lib/hooks/useProductos';
import { useCategorias } from '../../../../lib/hooks/useCategorias';
import { stockClasses } from '../../../../lib/utils/estado';
import type { Producto } from '../../../../types/producto';

const LIMIT = 10;

function formatMonto(value?: string | number | null) {
  if (value === null || value === undefined) return '—';
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? `Bs ${num.toFixed(2)}` : '—';
}

function ProductosPanelContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [stockBajo, setStockBajo] = useState(false);
  const [formState, setFormState] = useState<{ open: boolean; producto: Producto | null }>({
    open: false,
    producto: null,
  });
  const [movimientoTarget, setMovimientoTarget] = useState<Producto | null>(null);
  const [categoriasOpen, setCategoriasOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null);

  const { data: categorias } = useCategorias();
  const { data, isLoading, isFetching } = useProductos({ page, limit: LIMIT, search, categoriaId, stockBajo });
  const { remove } = useProductoMutations();

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const columns: Column<Producto>[] = [
    {
      key: 'nombre',
      header: 'Producto',
      render: (row) => (
        <div>
          <p className="font-medium text-graphite-900">{row.nombre}</p>
          {row.codigo && <p className="text-xs text-graphite-400">{row.codigo}</p>}
        </div>
      ),
    },
    { key: 'categoria', header: 'Categoría', render: (row) => row.categoria.nombre },
    { key: 'marca', header: 'Marca', render: (row) => row.marca ?? '—' },
    {
      key: 'stock',
      header: 'Stock',
      render: (row) => (
        <Badge
          label={`${row.stockActual} (mín. ${row.stockMinimo})`}
          className={stockClasses(row.stockActual, row.stockMinimo)}
        />
      ),
    },
    { key: 'precioReferencia', header: 'Precio ref.', render: (row) => formatMonto(row.precioReferencia) },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => setMovimientoTarget(row)}
            className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
            aria-label={`Registrar movimiento de ${row.nombre}`}
            title="Registrar movimiento"
          >
            <ArrowLeftRight size={15} />
          </button>
          <button
            type="button"
            onClick={() => setFormState({ open: true, producto: row })}
            className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
            aria-label={`Editar ${row.nombre}`}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="rounded-md p-1.5 text-graphite-400 hover:bg-red-50 hover:text-red-600"
            aria-label={`Eliminar ${row.nombre}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={handleSearchChange} placeholder="Buscar por nombre, código o marca…" />

          <select
            value={categoriaId ?? ''}
            onChange={(e) => {
              setCategoriaId(e.target.value ? Number(e.target.value) : undefined);
              setPage(1);
            }}
            className="rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          >
            <option value="">Todas las categorías</option>
            {categorias?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 whitespace-nowrap px-1 text-sm text-graphite-700">
            <input
              type="checkbox"
              checked={stockBajo}
              onChange={(e) => {
                setStockBajo(e.target.checked);
                setPage(1);
              }}
              className="rounded border-graphite-300"
            />
            Solo stock bajo
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCategoriasOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-graphite-200 px-3 py-2 text-sm font-medium text-graphite-700 hover:bg-graphite-50"
          >
            <ListTree size={15} />
            Categorías
          </button>
          <button
            type="button"
            onClick={() => setFormState({ open: true, producto: null })}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
          >
            <Plus size={16} />
            Nuevo producto
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        emptyMessage="No se encontraron productos."
        getRowId={(row) => row.id}
      />

      {data && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          onPageChange={setPage}
        />
      )}

      <ProductoFormModal
        open={formState.open}
        producto={formState.producto}
        onClose={() => setFormState({ open: false, producto: null })}
        onManageCategorias={() => setCategoriasOpen(true)}
      />

      <MovimientoFormModal
        open={!!movimientoTarget}
        onClose={() => setMovimientoTarget(null)}
        defaultProductoId={movimientoTarget?.id}
        defaultProductoLabel={movimientoTarget?.nombre}
        defaultStockActual={movimientoTarget?.stockActual}
        lockProducto
      />

      <CategoriasManagerModal open={categoriasOpen} onClose={() => setCategoriasOpen(false)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Desactivar producto"
        description={`¿Seguro que deseas desactivar "${deleteTarget?.nombre}"?`}
        confirmLabel="Desactivar"
        isLoading={remove.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
      />
    </div>
  );
}

export default function ProductosPanel() {
  return (
    <QueryProvider>
      <ProductosPanelContent />
    </QueryProvider>
  );
}
