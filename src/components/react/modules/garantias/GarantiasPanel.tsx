import { Plus } from 'lucide-react';
import { useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import Pagination from '../../ui/Pagination';
import Badge from '../../ui/Badge';
import GarantiaFormModal from '../../forms/GarantiaFormModal';
import QueryProvider from '../../providers/QueryProvider';
import { useGarantiaMutations, useGarantias } from '../../../../lib/hooks/useGarantias';
import { estadoGarantiaClasses, estadoGarantiaLabel } from '../../../../lib/utils/estado';
import { ESTADOS_GARANTIA, type EstadoGarantia, type Garantia } from '../../../../types/garantia';

const LIMIT = 15;

function formatFecha(value: string) {
  return new Date(value).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function GarantiasPanelContent() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, isFetching } = useGarantias({ page, limit: LIMIT });
  const { changeEstado } = useGarantiaMutations();

  const columns: Column<Garantia>[] = [
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
    { key: 'dias', header: 'Días', render: (row) => row.dias },
    { key: 'fechaInicio', header: 'Inicio', render: (row) => formatFecha(row.fechaInicio) },
    { key: 'fechaFin', header: 'Vence', render: (row) => formatFecha(row.fechaFin) },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => (
        <Badge label={estadoGarantiaLabel(row.estado)} className={estadoGarantiaClasses(row.estado)} />
      ),
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (row) => {
        const opciones: EstadoGarantia[] = ESTADOS_GARANTIA.filter((e) => e !== row.estado);
        return (
          <div className="flex justify-end gap-1">
            {opciones.map((estado) => (
              <button
                key={estado}
                type="button"
                onClick={() => changeEstado.mutate({ id: row.id, payload: { estado } })}
                disabled={changeEstado.isPending}
                className="rounded-md border border-graphite-200 px-2 py-1 text-xs font-medium text-graphite-600 hover:bg-graphite-50"
              >
                {estadoGarantiaLabel(estado)}
              </button>
            ))}
          </div>
        );
      },
    },
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
          Registrar garantía
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        emptyMessage="No se encontraron garantías."
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

      <GarantiaFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}

export default function GarantiasPanel() {
  return (
    <QueryProvider>
      <GarantiasPanelContent />
    </QueryProvider>
  );
}
