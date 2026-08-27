import { Plus } from 'lucide-react';
import { useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import SearchInput from '../../filters/SearchInput';
import Pagination from '../../ui/Pagination';
import Badge from '../../ui/Badge';
import ReparacionFormModal from '../../forms/ReparacionFormModal';
import AccessDenied from '../../ui/AccessDenied';
import QueryProvider from '../../providers/QueryProvider';
import { useReparaciones } from '../../../../lib/hooks/useReparaciones';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import { ApiError } from '../../../../lib/api/client';
import { useEstadosOrden } from '../../../../lib/hooks/useEstadosOrden';
import { estadoOrdenClasses, estadoOrdenLabel, prioridadClasses } from '../../../../lib/utils/estado';
import type { OrdenReparacion } from '../../../../types/reparacion';

const LIMIT = 10;

function formatFecha(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface ReparacionesPanelProps {
  clienteId?: number;
  equipoId?: number;
}

function ReparacionesPanelContent({ clienteId, equipoId }: ReparacionesPanelProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [estadoId, setEstadoId] = useState<number | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);

  const { data: estados } = useEstadosOrden();
  const { data, isLoading, isFetching, error } = useReparaciones({
    page,
    limit: LIMIT,
    search,
    clienteId,
    equipoId,
    estadoId,
  });

  const puedeCrear = usePermiso('reparaciones:crear');

  if (error instanceof ApiError && error.statusCode === 403) {
    return <AccessDenied />;
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleEstadoChange(value: string) {
    setEstadoId(value ? Number(value) : undefined);
    setPage(1);
  }

  function goToDetail(id: number) {
    window.location.href = `/reparaciones/${id}`;
  }

  const columns: Column<OrdenReparacion>[] = [
    {
      key: 'codigoOrden',
      header: 'Código',
      render: (row) => (
        <a href={`/reparaciones/${row.id}`} className="font-medium text-graphite-900 hover:underline">
          {row.codigoOrden}
        </a>
      ),
    },
    { key: 'cliente', header: 'Cliente', render: (row) => row.cliente.nombre },
    {
      key: 'equipo',
      header: 'Equipo',
      render: (row) => [row.equipo.tipoEquipo, row.equipo.marca, row.equipo.modelo].filter(Boolean).join(' '),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => (
        <Badge label={estadoOrdenLabel(row.estado.nombre)} className={estadoOrdenClasses(row.estado.nombre)} />
      ),
    },
    {
      key: 'prioridad',
      header: 'Prioridad',
      render: (row) => <Badge label={row.prioridad ?? 'NORMAL'} className={prioridadClasses(row.prioridad)} />,
    },
    { key: 'fechaIngreso', header: 'Ingreso', render: (row) => formatFecha(row.fechaIngreso) },
    { key: 'fechaPromesa', header: 'Promesa', render: (row) => formatFecha(row.fechaPromesa) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar por código o falla reportada…"
          />

          <select
            value={estadoId ?? ''}
            onChange={(e) => handleEstadoChange(e.target.value)}
            className="rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          >
            <option value="">Todos los estados</option>
            {estados?.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estadoOrdenLabel(estado.nombre)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
          hidden={!puedeCrear}
        >
          <Plus size={16} />
          Nueva orden
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        emptyMessage="No se encontraron órdenes de reparación."
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

      <ReparacionFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaultClienteId={clienteId}
        onCreated={goToDetail}
      />
    </div>
  );
}

export default function ReparacionesPanel(props: ReparacionesPanelProps) {
  return (
    <QueryProvider>
      <ReparacionesPanelContent {...props} />
    </QueryProvider>
  );
}
