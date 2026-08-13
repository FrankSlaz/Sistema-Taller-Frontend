import { Plus } from 'lucide-react';
import { useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import Pagination from '../../ui/Pagination';
import EntregaFormModal from '../../forms/EntregaFormModal';
import QueryProvider from '../../providers/QueryProvider';
import { useEntregas } from '../../../../lib/hooks/useEntregas';
import type { Entrega } from '../../../../types/entrega';

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

function EntregasPanelContent() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, isFetching } = useEntregas({ page, limit: LIMIT });

  const columns: Column<Entrega>[] = [
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
    { key: 'nombreRecibe', header: 'Recibió', render: (row) => row.nombreRecibe ?? '—' },
    { key: 'documentoRecibe', header: 'Documento', render: (row) => row.documentoRecibe ?? '—' },
    {
      key: 'usuarioEntrega',
      header: 'Registrada por',
      render: (row) =>
        row.usuarioEntrega ? `${row.usuarioEntrega.nombre} ${row.usuarioEntrega.apellido ?? ''}`.trim() : '—',
    },
    { key: 'fechaEntrega', header: 'Fecha', render: (row) => formatFechaHora(row.fechaEntrega) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
        >
          <Plus size={16} />
          Registrar entrega
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        emptyMessage="No se encontraron entregas."
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

      <EntregaFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}

export default function EntregasPanel() {
  return (
    <QueryProvider>
      <EntregasPanelContent />
    </QueryProvider>
  );
}
