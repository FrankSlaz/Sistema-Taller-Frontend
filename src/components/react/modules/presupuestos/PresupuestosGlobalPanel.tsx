import { Check, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import Pagination from '../../ui/Pagination';
import Badge from '../../ui/Badge';
import ConfirmDialog from '../../ui/ConfirmDialog';
import PresupuestoFormModal from '../../forms/PresupuestoFormModal';
import QueryProvider from '../../providers/QueryProvider';
import { usePresupuestoMutations, usePresupuestos } from '../../../../lib/hooks/usePresupuestos';
import { ESTADOS_PRESUPUESTO, type Presupuesto } from '../../../../types/presupuesto';
import { estadoPresupuestoClasses, estadoPresupuestoLabel } from '../../../../lib/utils/estado';

const LIMIT = 10;

function formatMonto(value?: string | number | null) {
  if (value === null || value === undefined) return '—';
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? `Bs ${num.toFixed(2)}` : '—';
}

function formatFecha(value: string) {
  return new Date(value).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function PresupuestosGlobalPanelContent() {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<string>('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Presupuesto | null>(null);

  const { data, isLoading, isFetching } = usePresupuestos({ page, limit: LIMIT, estado: estado || undefined });
  const { changeEstado, remove } = usePresupuestoMutations();

  function handleEstadoChange(value: string) {
    setEstado(value);
    setPage(1);
  }

  const columns: Column<Presupuesto>[] = [
    {
      key: 'orden',
      header: 'Orden',
      render: (row) =>
        row.orden ? (
          <a href={`/reparaciones/${row.orden.id}`} className="font-medium text-graphite-900 hover:underline">
            {row.orden.codigoOrden}
          </a>
        ) : (
          `#${row.ordenId}`
        ),
    },
    { key: 'descripcion', header: 'Descripción', render: (row) => row.descripcion || '—' },
    {
      key: 'tecnico',
      header: 'Técnico',
      render: (row) => (row.tecnico ? `${row.tecnico.nombre} ${row.tecnico.apellido ?? ''}`.trim() : '—'),
    },
    { key: 'totalEstimado', header: 'Total', render: (row) => formatMonto(row.totalEstimado) },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => (
        <Badge label={estadoPresupuestoLabel(row.estado)} className={estadoPresupuestoClasses(row.estado)} />
      ),
    },
    { key: 'fecha', header: 'Fecha', render: (row) => formatFecha(row.fecha) },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.estado === 'PENDIENTE' && (
            <>
              <button
                type="button"
                onClick={() => changeEstado.mutate({ id: row.id, payload: { estado: 'APROBADO' } })}
                className="rounded-md p-1.5 text-graphite-400 hover:bg-green-50 hover:text-green-700"
                aria-label="Aprobar presupuesto"
              >
                <Check size={15} />
              </button>
              <button
                type="button"
                onClick={() => changeEstado.mutate({ id: row.id, payload: { estado: 'RECHAZADO' } })}
                className="rounded-md p-1.5 text-graphite-400 hover:bg-red-50 hover:text-red-700"
                aria-label="Rechazar presupuesto"
              >
                <X size={15} />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="rounded-md p-1.5 text-graphite-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Eliminar presupuesto"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={estado}
          onChange={(e) => handleEstadoChange(e.target.value)}
          className="rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800 sm:w-56"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_PRESUPUESTO.map((e) => (
            <option key={e} value={e}>
              {estadoPresupuestoLabel(e)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
        >
          <Plus size={16} />
          Nuevo presupuesto
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        emptyMessage="No se encontraron presupuestos."
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

      <PresupuestoFormModal open={formOpen} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar presupuesto"
        description="¿Seguro que deseas eliminar este presupuesto? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
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

export default function PresupuestosGlobalPanel() {
  return (
    <QueryProvider>
      <PresupuestosGlobalPanelContent />
    </QueryProvider>
  );
}
