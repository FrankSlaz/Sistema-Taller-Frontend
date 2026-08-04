import { Plus } from 'lucide-react';
import { useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import Pagination from '../../ui/Pagination';
import Badge from '../../ui/Badge';
import MovimientoFormModal from '../../forms/MovimientoFormModal';
import ProductoSelect from '../../forms/ProductoSelect';
import QueryProvider from '../../providers/QueryProvider';
import { useMovimientos } from '../../../../lib/hooks/useMovimientos';
import { tipoMovimientoClasses, tipoMovimientoLabel } from '../../../../lib/utils/estado';
import type { MovimientoInventario } from '../../../../types/movimiento';

const LIMIT = 15;

function formatFechaHora(value: string) {
  return new Date(value).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface MovimientosPanelProps {
  productoId?: number;
  productoNombre?: string;
}

function MovimientosPanelContent({ productoId: initialProductoId, productoNombre }: MovimientosPanelProps) {
  const [page, setPage] = useState(1);
  const [productoId, setProductoId] = useState<number | undefined>(initialProductoId);
  const [productoLabel, setProductoLabel] = useState(productoNombre ?? '');
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, isFetching } = useMovimientos({ page, limit: LIMIT, productoId });

  const columns: Column<MovimientoInventario>[] = [
    { key: 'fecha', header: 'Fecha', render: (row) => formatFechaHora(row.fecha) },
    {
      key: 'producto',
      header: 'Producto',
      render: (row) => (
        <div>
          <p className="text-graphite-900">{row.producto.nombre}</p>
          {row.producto.codigo && <p className="text-xs text-graphite-400">{row.producto.codigo}</p>}
        </div>
      ),
    },
    {
      key: 'tipoMovimiento',
      header: 'Tipo',
      render: (row) => (
        <Badge label={tipoMovimientoLabel(row.tipoMovimiento)} className={tipoMovimientoClasses(row.tipoMovimiento)} />
      ),
    },
    { key: 'cantidad', header: 'Cantidad', render: (row) => row.cantidad },
    {
      key: 'stock',
      header: 'Stock (antes → después)',
      render: (row) => `${row.stockAnterior} → ${row.stockNuevo}`,
    },
    {
      key: 'usuario',
      header: 'Usuario',
      render: (row) => (row.usuario ? `${row.usuario.nombre} ${row.usuario.apellido ?? ''}`.trim() : '—'),
    },
    { key: 'motivo', header: 'Motivo', render: (row) => row.motivo ?? '—' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <ProductoSelect
            value={productoId ?? null}
            initialLabel={productoLabel}
            onChange={(id, label) => {
              setProductoId(id);
              setProductoLabel(label);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          {productoId && (
            <button
              type="button"
              onClick={() => {
                setProductoId(undefined);
                setProductoLabel('');
                setPage(1);
              }}
              className="text-sm font-medium text-graphite-500 hover:text-graphite-900 hover:underline"
            >
              Quitar filtro
            </button>
          )}

          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
          >
            <Plus size={16} />
            Registrar movimiento
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        emptyMessage="No se encontraron movimientos."
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

      <MovimientoFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaultProductoId={productoId}
        defaultProductoLabel={productoLabel}
      />
    </div>
  );
}

export default function MovimientosPanel(props: MovimientosPanelProps) {
  return (
    <QueryProvider>
      <MovimientosPanelContent {...props} />
    </QueryProvider>
  );
}
