import { Camera, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import SearchInput from '../../filters/SearchInput';
import Pagination from '../../ui/Pagination';
import { BadgeActivo, BotonActivo, ConfirmarActivo, FiltroActivoSelector, type FiltroActivo } from '../../ui/Activacion';
import EquipoFormModal from '../../forms/EquipoFormModal';
import AccessDenied from '../../ui/AccessDenied';
import AuthImage from '../archivos/AuthImage';
import FotosEquipoModal from '../archivos/FotosEquipoModal';
import QueryProvider from '../../providers/QueryProvider';
import { useEquipoMutations, useEquipos } from '../../../../lib/hooks/useEquipos';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import { ApiError } from '../../../../lib/api/client';
import type { Equipo } from '../../../../types/equipo';

const LIMIT = 10;
const msgError = (e: unknown) => (e instanceof ApiError ? e.message : e ? 'Error inesperado' : null);

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
  const [filtro, setFiltro] = useState<FiltroActivo>('activos');
  const [activoTarget, setActivoTarget] = useState<Equipo | null>(null);

  const { data, isLoading, isFetching, error } = useEquipos({ page, limit: LIMIT, search, clienteId, estado: filtro });
  const { cambiarActivo } = useEquipoMutations();

  const puedeCrear = usePermiso('equipos:crear');
  const puedeEditar = usePermiso('equipos:editar');
  const puedeEliminar = usePermiso('equipos:eliminar');
  const puedeVerFotos = usePermiso('archivos:ver');
  const [fotosTarget, setFotosTarget] = useState<Equipo | null>(null);

  if (error instanceof ApiError && error.statusCode === 403) {
    return <AccessDenied />;
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const columns: Column<Equipo>[] = [
    // Miniatura: la primera foto subida identifica el equipo de un vistazo.
    // Se oculta (no solo la imagen) si el usuario no tiene archivos:ver.
    ...(puedeVerFotos
      ? [
          {
            key: 'foto',
            header: '',
            render: (row: Equipo) => (
              <button
                type="button"
                onClick={() => setFotosTarget(row)}
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-md bg-graphite-100 text-graphite-400 hover:ring-2 hover:ring-graphite-300"
                aria-label={`Ver fotos del equipo ${row.id}`}
              >
                {row.fotoPrincipalId ? (
                  <AuthImage
                    archivoId={row.fotoPrincipalId}
                    alt={`Foto de ${row.tipoEquipo}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera size={16} />
                )}
              </button>
            ),
          } as Column<Equipo>,
        ]
      : []),
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
    { key: 'estado', header: 'Estado', render: (row) => <BadgeActivo activo={row.estado} /> },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {puedeVerFotos && (
            <button
              type="button"
              onClick={() => setFotosTarget(row)}
              className="inline-flex items-center gap-1 rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
              aria-label={`Fotos del equipo ${row.id}`}
              title="Fotos"
            >
              <Camera size={15} />
              {!!row._count?.archivos && <span className="text-xs">{row._count.archivos}</span>}
            </button>
          )}
          <button
            type="button"
            onClick={() => setFormState({ open: true, equipo: row })}
            className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
            aria-label={`Editar equipo ${row.id}`}
            hidden={!puedeEditar}
          >
            <Pencil size={15} />
          </button>
          {puedeEliminar && (
            <BotonActivo
              activo={row.estado}
              nombre={`el equipo ${row.tipoEquipo} ${row.marca ?? ''}`.trim()}
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
            placeholder={clienteId ? 'Buscar por tipo, marca, modelo, serie o IMEI…' : 'Buscar por cliente, tipo, marca, modelo, serie o IMEI…'}
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

      <FotosEquipoModal equipo={fotosTarget} onClose={() => setFotosTarget(null)} />

      <ConfirmarActivo
        objetivo={
          activoTarget && {
            nombre: [activoTarget.tipoEquipo, activoTarget.marca, activoTarget.modelo].filter(Boolean).join(' '),
            activo: activoTarget.estado,
          }
        }
        entidad="el equipo"
        efectoDesactivar="No se le podrán crear órdenes nuevas."
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

export default function EquiposPanel(props: EquiposPanelProps) {
  return (
    <QueryProvider>
      <EquiposPanelContent {...props} />
    </QueryProvider>
  );
}
