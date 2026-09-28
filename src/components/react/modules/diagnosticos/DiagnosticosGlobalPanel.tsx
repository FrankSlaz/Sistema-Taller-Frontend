import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import Pagination from '../../ui/Pagination';
import ConfirmDialog from '../../ui/ConfirmDialog';
import AccessDenied from '../../ui/AccessDenied';
import DiagnosticoFormModal from '../../forms/DiagnosticoFormModal';
import OrdenSelect from '../../forms/OrdenSelect';
import QueryProvider from '../../providers/QueryProvider';
import { useDiagnosticoMutations, useDiagnosticos } from '../../../../lib/hooks/useDiagnosticos';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import { ApiError } from '../../../../lib/api/client';
import type { Diagnostico } from '../../../../types/diagnostico';

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

function truncar(texto: string | null | undefined, max = 60) {
  if (!texto) return '—';
  return texto.length > max ? `${texto.slice(0, max)}…` : texto;
}

function DiagnosticosGlobalPanelContent() {
  const [page, setPage] = useState(1);
  const [ordenId, setOrdenId] = useState<number | undefined>(undefined);
  const [ordenLabel, setOrdenLabel] = useState('');
  const [formState, setFormState] = useState<{ open: boolean; diagnostico: Diagnostico | null }>({
    open: false,
    diagnostico: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Diagnostico | null>(null);

  const { data, isLoading, isFetching, error } = useDiagnosticos({ page, limit: LIMIT, ordenId });
  const { remove } = useDiagnosticoMutations();

  const puedeCrear = usePermiso('diagnosticos:crear');
  const puedeEditar = usePermiso('diagnosticos:editar');
  const puedeEliminar = usePermiso('diagnosticos:eliminar');

  if (error instanceof ApiError && error.statusCode === 403) {
    return <AccessDenied />;
  }

  const columns: Column<Diagnostico>[] = [
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
    {
      key: 'tecnico',
      header: 'Técnico',
      render: (row) => (row.tecnico ? `${row.tecnico.nombre} ${row.tecnico.apellido ?? ''}`.trim() : '—'),
    },
    { key: 'fallaDetectada', header: 'Falla detectada', render: (row) => truncar(row.fallaDetectada) },
    { key: 'diagnostico', header: 'Diagnóstico', render: (row) => truncar(row.diagnostico) },
    { key: 'fecha', header: 'Fecha', render: (row) => formatFechaHora(row.fecha) },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {puedeEditar && (
            <button
              type="button"
              onClick={() => setFormState({ open: true, diagnostico: row })}
              className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
              aria-label="Editar diagnóstico"
            >
              <Pencil size={15} />
            </button>
          )}
          {puedeEliminar && (
            <button
              type="button"
              onClick={() => setDeleteTarget(row)}
              className="rounded-md p-1.5 text-graphite-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Eliminar diagnóstico"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
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
              onClick={() => setFormState({ open: true, diagnostico: null })}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
            >
              <Plus size={16} />
              Nuevo diagnóstico
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        emptyMessage="No se encontraron diagnósticos."
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

      <DiagnosticoFormModal
        open={formState.open}
        diagnostico={formState.diagnostico}
        onClose={() => setFormState({ open: false, diagnostico: null })}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar diagnóstico"
        description="¿Seguro que deseas eliminar este diagnóstico? Esta acción no se puede deshacer."
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

export default function DiagnosticosGlobalPanel() {
  return (
    <QueryProvider>
      <DiagnosticosGlobalPanelContent />
    </QueryProvider>
  );
}
