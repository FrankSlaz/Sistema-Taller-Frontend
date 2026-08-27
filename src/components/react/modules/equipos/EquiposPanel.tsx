import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import SearchInput from '../../filters/SearchInput';
import Pagination from '../../ui/Pagination';
import ConfirmDialog from '../../ui/ConfirmDialog';
import EquipoFormModal from '../../forms/EquipoFormModal';
import AccessDenied from '../../ui/AccessDenied';
import QueryProvider from '../../providers/QueryProvider';
import { useEquipoMutations, useEquipos } from '../../../../lib/hooks/useEquipos';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import { ApiError } from '../../../../lib/api/client';
import type { Equipo } from '../../../../types/equipo';

const LIMIT = 10;

interface EquiposPanelProps {
  /** Si se provee, fija el listado a los equipos de ese cliente (ej. desde su ficha). */
  clienteId?: number;
  clienteNombre?: string;
}

function EquiposPanelContent({ clienteId, clienteNombre }: EquiposPanelProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formState, setFormState] = useState<{ open: boolean; equipo: Equipo | null }>({
    open: false,
    equipo: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Equipo | null>(null);

  const { data, isLoading, isFetching, error } = useEquipos({ page, limit: LIMIT, search, clienteId });
  const { remove } = useEquipoMutations();

  const puedeCrear = usePermiso('equipos:crear');
  const puedeEditar = usePermiso('equipos:editar');
  const puedeEliminar = usePermiso('equipos:eliminar');

  if (error instanceof ApiError && error.statusCode === 403) {
    return <AccessDenied />;
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const columns: Column<Equipo>[] = [
    ...(clienteId
      ? []
      : [
          {
            key: 'cliente',
            header: 'Cliente',
            render: (row: Equipo) => row.cliente?.nombre ?? `#${row.clienteId}`,
          } as Column<Equipo>,
        ]),
    { key: 'tipoEquipo', header: 'Tipo' },
    {
      key: 'marcaModelo',
      header: 'Marca / Modelo',
      render: (row) => [row.marca, row.modelo].filter(Boolean).join(' ') || '—',
    },
    {
      key: 'identificadores',
      header: 'Serie / IMEI',
      render: (row) => row.numeroSerie ?? row.imei ?? '—',
    },
    {
      key: 'ordenes',
      header: 'Órdenes',
      render: (row) => row._count?.ordenesReparacion ?? 0,
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => setFormState({ open: true, equipo: row })}
            className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
            aria-label={`Editar equipo ${row.id}`}
            hidden={!puedeEditar}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="rounded-md p-1.5 text-graphite-400 hover:bg-red-50 hover:text-red-600"
            aria-label={`Eliminar equipo ${row.id}`}
            hidden={!puedeEliminar}
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
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Buscar por marca, modelo, serie o IMEI…"
        />

        <button
          type="button"
          onClick={() => setFormState({ open: true, equipo: null })}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
          hidden={!puedeCrear}
        >
          <Plus size={16} />
          Nuevo equipo
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        emptyMessage={
          clienteId ? 'Este cliente aún no tiene equipos registrados.' : 'No se encontraron equipos.'
        }
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

      <EquipoFormModal
        open={formState.open}
        equipo={formState.equipo}
        defaultClienteId={clienteId}
        defaultClienteNombre={clienteNombre}
        onClose={() => setFormState({ open: false, equipo: null })}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Desactivar equipo"
        description={`¿Seguro que deseas desactivar el equipo "${deleteTarget?.tipoEquipo} ${
          deleteTarget?.marca ?? ''
        }"?`}
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

export default function EquiposPanel(props: EquiposPanelProps) {
  return (
    <QueryProvider>
      <EquiposPanelContent {...props} />
    </QueryProvider>
  );
}
