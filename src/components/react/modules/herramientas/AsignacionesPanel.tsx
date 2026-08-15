import { Undo2 } from 'lucide-react';
import { useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import Pagination from '../../ui/Pagination';
import QueryProvider from '../../providers/QueryProvider';
import { useAsignaciones } from '../../../../lib/hooks/useAsignaciones';
import { useHerramientaMutations } from '../../../../lib/hooks/useHerramientas';
import type { HerramientaAsignada } from '../../../../types/herramienta';

const LIMIT = 15;

function formatFecha(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function AsignacionesPanelContent() {
  const [page, setPage] = useState(1);
  const [soloActivas, setSoloActivas] = useState(true);

  const { data, isLoading, isFetching } = useAsignaciones({ page, limit: LIMIT, activas: soloActivas || undefined });
  const { devolver } = useHerramientaMutations();

  const columns: Column<HerramientaAsignada>[] = [
    {
      key: 'herramienta',
      header: 'Herramienta',
      render: (row) =>
        [row.herramienta?.nombre, row.herramienta?.marca, row.herramienta?.modelo].filter(Boolean).join(' ') ||
        `#${row.herramientaId}`,
    },
    {
      key: 'usuario',
      header: 'Asignada a',
      render: (row) => `${row.usuario.nombre} ${row.usuario.apellido ?? ''}`.trim(),
    },
    { key: 'fechaEntrega', header: 'Entrega', render: (row) => formatFecha(row.fechaEntrega) },
    {
      key: 'fechaDevolucion',
      header: 'Devolución',
      render: (row) => (row.fechaDevolucion ? formatFecha(row.fechaDevolucion) : '—'),
    },
    { key: 'observaciones', header: 'Observaciones', render: (row) => row.observaciones ?? '—' },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (row) =>
        !row.fechaDevolucion ? (
          <button
            type="button"
            onClick={() => devolver.mutate(row.id)}
            disabled={devolver.isPending}
            className="inline-flex items-center gap-1 rounded-md border border-graphite-200 px-2.5 py-1 text-xs font-medium text-graphite-700 hover:bg-graphite-50"
          >
            <Undo2 size={13} />
            Devolver
          </button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <label className="flex w-fit items-center gap-2 text-sm text-graphite-700">
        <input
          type="checkbox"
          checked={soloActivas}
          onChange={(e) => {
            setSoloActivas(e.target.checked);
            setPage(1);
          }}
          className="rounded border-graphite-300"
        />
        Solo préstamos activos
      </label>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        emptyMessage="No se encontraron asignaciones."
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
    </div>
  );
}

export default function AsignacionesPanel() {
  return (
    <QueryProvider>
      <AsignacionesPanelContent />
    </QueryProvider>
  );
}
