import { Pencil, Plus, Trash2, Wrench } from 'lucide-react';
import { useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import SearchInput from '../../filters/SearchInput';
import Pagination from '../../ui/Pagination';
import ConfirmDialog from '../../ui/ConfirmDialog';
import AccessDenied from '../../ui/AccessDenied';
import ClienteFormModal from '../../forms/ClienteFormModal';
import QueryProvider from '../../providers/QueryProvider';
import { useClienteMutations, useClientes } from '../../../../lib/hooks/useClientes';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import { ApiError } from '../../../../lib/api/client';
import type { Cliente } from '../../../../types/cliente';

const LIMIT = 10;

function ClientesPanelContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formState, setFormState] = useState<{ open: boolean; cliente: Cliente | null }>({
    open: false,
    cliente: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);

  const { data, isLoading, isFetching, error } = useClientes({ page, limit: LIMIT, search });
  const { remove } = useClienteMutations();

  const puedeCrear = usePermiso('clientes:crear');
  const puedeEditar = usePermiso('clientes:editar');
  const puedeEliminar = usePermiso('clientes:eliminar');

  if (error instanceof ApiError && error.statusCode === 403) {
    return <AccessDenied />;
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const columns: Column<Cliente>[] = [
    { key: 'nombre', header: 'Nombre' },
    {
      key: 'documento',
      header: 'Documento',
      render: (row) =>
        row.numeroDocumento ? `${row.tipoDocumento ?? ''} ${row.numeroDocumento}`.trim() : '—',
    },
    { key: 'telefono', header: 'Teléfono', render: (row) => row.telefono ?? '—' },
    { key: 'email', header: 'Email', render: (row) => row.email ?? '—' },
    {
      key: 'equipos',
      header: 'Equipos',
      render: (row) => row._count?.equipos ?? 0,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => (
        <span
          className={
            row.estado
              ? 'inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20'
              : 'inline-flex items-center rounded-full bg-graphite-100 px-2.5 py-0.5 text-xs font-medium text-graphite-600 ring-1 ring-inset ring-graphite-500/20'
          }
        >
          {row.estado ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <a
            href={`/equipos?clienteId=${row.id}&clienteNombre=${encodeURIComponent(row.nombre)}`}
            className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
            aria-label={`Ver equipos de ${row.nombre}`}
          >
            <Wrench size={15} />
          </a>
          <button
            type="button"
            onClick={() => setFormState({ open: true, cliente: row })}
            className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
            aria-label={`Editar ${row.nombre}`}
            disabled={!puedeEditar}
            hidden={!puedeEditar}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="rounded-md p-1.5 text-graphite-400 hover:bg-red-50 hover:text-red-600"
            aria-label={`Eliminar ${row.nombre}`}
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
          placeholder="Buscar por nombre, documento o teléfono…"
        />

        <button
          type="button"
          onClick={() => setFormState({ open: true, cliente: null })}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
          hidden={!puedeCrear}
        >
          <Plus size={16} />
          Nuevo cliente
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        emptyMessage="No se encontraron clientes."
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

      <ClienteFormModal
        open={formState.open}
        cliente={formState.cliente}
        onClose={() => setFormState({ open: false, cliente: null })}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Desactivar cliente"
        description={`¿Seguro que deseas desactivar a "${deleteTarget?.nombre}"? Podrás reactivarlo luego editándolo.`}
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

export default function ClientesPanel() {
  return (
    <QueryProvider>
      <ClientesPanelContent />
    </QueryProvider>
  );
}
