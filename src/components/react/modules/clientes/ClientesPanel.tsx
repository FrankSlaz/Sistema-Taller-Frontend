import { Pencil, Plus, Wrench } from 'lucide-react';
import { useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import SearchInput from '../../filters/SearchInput';
import Pagination from '../../ui/Pagination';
import { BadgeActivo, BotonActivo, ConfirmarActivo, FiltroActivoSelector, type FiltroActivo } from '../../ui/Activacion';
import AccessDenied from '../../ui/AccessDenied';
import ClienteFormModal from '../../forms/ClienteFormModal';
import QueryProvider from '../../providers/QueryProvider';
import { useClienteMutations, useClientes } from '../../../../lib/hooks/useClientes';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import { ApiError } from '../../../../lib/api/client';
import type { Cliente } from '../../../../types/cliente';
import Tip from '../../ui/Tip';

const LIMIT = 10;
const msgError = (e: unknown) => (e instanceof ApiError ? e.message : e ? 'Error inesperado' : null);

function ClientesPanelContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formState, setFormState] = useState<{ open: boolean; cliente: Cliente | null }>({
    open: false,
    cliente: null,
  });
  const [filtro, setFiltro] = useState<FiltroActivo>('activos');
  const [activoTarget, setActivoTarget] = useState<Cliente | null>(null);

  const { data, isLoading, isFetching, error } = useClientes({ page, limit: LIMIT, search, estado: filtro });
  const { cambiarActivo } = useClienteMutations();

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
      render: (row) => <BadgeActivo activo={row.estado} />,
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Tip label="Ver equipos">
            <a
              href={`/equipos?clienteId=${row.id}&clienteNombre=${encodeURIComponent(row.nombre)}`}
              className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
              aria-label={`Ver equipos de ${row.nombre}`}
            >
              <Wrench size={15} />
            </a>
          </Tip>
          <Tip label="Editar">
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
          </Tip>
          {puedeEliminar && (
            <BotonActivo
              activo={row.estado}
              nombre={row.nombre}
              onClick={() => {
                cambiarActivo.reset();
                setActivoTarget(row);
              }}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar por nombre, documento o teléfono…"
          />
          <FiltroActivoSelector
            valor={filtro}
            onChange={(v) => {
              setFiltro(v);
              setPage(1);
            }}
          />
        </div>

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
        emptyMessage={filtro === 'inactivos' ? 'No hay clientes inactivos.' : 'No se encontraron clientes.'}
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

      <ConfirmarActivo
        objetivo={activoTarget && { nombre: activoTarget.nombre, activo: activoTarget.estado }}
        entidad="el cliente"
        efectoDesactivar="No se le podrán crear órdenes ni registrar equipos nuevos."
        isLoading={cambiarActivo.isPending}
        error={msgError(cambiarActivo.error)}
        onClose={() => setActivoTarget(null)}
        onConfirm={() =>
          activoTarget &&
          cambiarActivo.mutate(
            { id: activoTarget.id, activo: activoTarget.estado === false },
            { onSuccess: () => setActivoTarget(null) },
          )
        }
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
