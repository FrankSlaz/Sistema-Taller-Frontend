import { Plus, Truck } from 'lucide-react';
import { useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import Pagination from '../../ui/Pagination';
import CompraFormModal from '../../forms/CompraFormModal';
import CompraDetailModal from '../../forms/CompraDetailModal';
import ProveedoresManagerModal from './ProveedoresManagerModal';
import QueryProvider from '../../providers/QueryProvider';
import { useCompras } from '../../../../lib/hooks/useCompras';
import { useProveedores } from '../../../../lib/hooks/useProveedores';
import type { Compra } from '../../../../types/compra';

const LIMIT = 10;

function formatMonto(value: string | number) {
  const num = typeof value === 'string' ? Number(value) : value;
  return `Bs ${Number.isFinite(num) ? num.toFixed(2) : '0.00'}`;
}

function formatFecha(value: string) {
  return new Date(value).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ComprasPanelContent() {
  const [page, setPage] = useState(1);
  const [proveedorId, setProveedorId] = useState<number | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [proveedoresOpen, setProveedoresOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<Compra | null>(null);

  const { data: proveedores } = useProveedores();
  const { data, isLoading, isFetching } = useCompras({ page, limit: LIMIT, proveedorId });

  const columns: Column<Compra>[] = [
    {
      key: 'numeroCompra',
      header: 'N.º',
      render: (row) => (
        <button
          type="button"
          onClick={() => setDetailTarget(row)}
          className="font-medium text-graphite-900 hover:underline"
        >
          {row.numeroCompra || `#${row.id}`}
        </button>
      ),
    },
    { key: 'proveedor', header: 'Proveedor', render: (row) => row.proveedor?.nombre ?? '—' },
    { key: 'items', header: 'Productos', render: (row) => `${row.detalles.length} línea(s)` },
    { key: 'total', header: 'Total', render: (row) => formatMonto(row.total) },
    {
      key: 'usuario',
      header: 'Registrada por',
      render: (row) => (row.usuario ? `${row.usuario.nombre} ${row.usuario.apellido ?? ''}`.trim() : '—'),
    },
    { key: 'fecha', header: 'Fecha', render: (row) => formatFecha(row.fecha) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={proveedorId ?? ''}
          onChange={(e) => {
            setProveedorId(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
          className="rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800 sm:w-64"
        >
          <option value="">Todos los proveedores</option>
          {proveedores?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setProveedoresOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-graphite-200 px-3 py-2 text-sm font-medium text-graphite-700 hover:bg-graphite-50"
          >
            <Truck size={15} />
            Proveedores
          </button>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
          >
            <Plus size={16} />
            Registrar compra
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        emptyMessage="No se encontraron compras."
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

      <CompraFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <CompraDetailModal compra={detailTarget} onClose={() => setDetailTarget(null)} />
      <ProveedoresManagerModal open={proveedoresOpen} onClose={() => setProveedoresOpen(false)} />
    </div>
  );
}

export default function ComprasPanel() {
  return (
    <QueryProvider>
      <ComprasPanelContent />
    </QueryProvider>
  );
}
