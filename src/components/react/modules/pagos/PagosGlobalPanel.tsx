import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import Pagination from '../../ui/Pagination';
import ConfirmDialog from '../../ui/ConfirmDialog';
import AccessDenied from '../../ui/AccessDenied';
import PagoFormModal from '../../forms/PagoFormModal';
import OrdenSelect from '../../forms/OrdenSelect';
import QueryProvider from '../../providers/QueryProvider';
import { usePagoMutations, usePagos } from '../../../../lib/hooks/usePagos';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import { ApiError } from '../../../../lib/api/client';
import type { Pago } from '../../../../types/pago';

const LIMIT = 15;

function formatMonto(value: string | number) {
  const num = typeof value === 'string' ? Number(value) : value;
  return `Bs ${Number.isFinite(num) ? num.toFixed(2) : '0.00'}`;
}

function formatFechaHora(value: string) {
  return new Date(value).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function PagosGlobalPanelContent() {
  const [page, setPage] = useState(1);
  const [ordenId, setOrdenId] = useState<number | undefined>(undefined);
  const [ordenLabel, setOrdenLabel] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pago | null>(null);

  const { data, isLoading, isFetching, error } = usePagos({ page, limit: LIMIT, ordenId });
  const { remove } = usePagoMutations();

  const puedeCrear = usePermiso('pagos:crear');
  const puedeEliminar = usePermiso('pagos:eliminar');

  if (error instanceof ApiError && error.statusCode === 403) {
    return <AccessDenied />;
  }

  const columns: Column<Pago>[] = [
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
    { key: 'monto', header: 'Monto', render: (row) => formatMonto(row.monto) },
    { key: 'metodoPago', header: 'Método', render: (row) => row.metodoPago ?? '—' },
    { key: 'referencia', header: 'Referencia', render: (row) => row.referencia ?? '—' },
    { key: 'fecha', header: 'Fecha', render: (row) => formatFechaHora(row.fecha) },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (row) =>
        puedeEliminar ? (
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="rounded-md p-1.5 text-graphite-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Eliminar pago"
          >
            <Trash2 size={15} />
          </button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <OrdenSelect
            value={ordenId ?? null}
            initialLabel={ordenLabel}
            onChange={(id, label) => {
              setOrdenId(id);
              setOrdenLabel(label);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          {ordenId && (
            <button
              type="button"
              onClick={() => {
                setOrdenId(undefined);
                setOrdenLabel('');
                setPage(1);
              }}
              className="text-sm font-medium text-graphite-500 hover:text-graphite-900 hover:underline"
            >
              Quitar filtro
            </button>
          )}

          {puedeCrear && (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
            >
              <Plus size={16} />
              Registrar pago
            </button>
          )}
        </div>
      </div>

      {data?.resumen && (
        <div className="grid grid-cols-3 gap-2 rounded-md bg-graphite-50 p-3 text-center">
          <div>
            <p className="text-xs text-graphite-400">Total orden</p>
            <p className="font-display text-sm font-semibold text-graphite-900">
              {formatMonto(data.resumen.totalOrden)}
            </p>
          </div>
          <div>
            <p className="text-xs text-graphite-400">Pagado</p>
            <p className="font-display text-sm font-semibold text-green-700">
              {formatMonto(data.resumen.totalPagado)}
            </p>
          </div>
          <div>
            <p className="text-xs text-graphite-400">Saldo pendiente</p>
            <p className="font-display text-sm font-semibold text-amber-700">
              {formatMonto(data.resumen.saldoPendiente)}
            </p>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        emptyMessage="No se encontraron pagos."
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

      <PagoFormModal open={formOpen} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar pago"
        description="¿Seguro que deseas eliminar este pago? Esta acción no se puede deshacer."
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

export default function PagosGlobalPanel() {
  return (
    <QueryProvider>
      <PagosGlobalPanelContent />
    </QueryProvider>
  );
}
