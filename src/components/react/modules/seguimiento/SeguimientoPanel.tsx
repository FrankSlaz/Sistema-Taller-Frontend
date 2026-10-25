import { useMemo, useState } from 'react';
import EstadoCard from './EstadoCard';
import DataTable, { type Column } from '../../tables/DataTable';
import SearchInput from '../../filters/SearchInput';
import Pagination from '../../ui/Pagination';
import Badge from '../../ui/Badge';
import AccessDenied from '../../ui/AccessDenied';
import QueryProvider from '../../providers/QueryProvider';
import { useAuth } from '../../../../lib/hooks/useAuth';
import { useConteoPorEstado, useReparaciones, useTecnicos } from '../../../../lib/hooks/useReparaciones';
import { estadoOrdenClasses, estadoOrdenLabel } from '../../../../lib/utils/estado';
import { ApiError } from '../../../../lib/api/client';
import type { OrdenReparacion } from '../../../../types/reparacion';

const LIMIT = 15;

/**
 * Las 6 tarjetas pedidas, en el orden que deben mostrarse. El backend
 * devuelve los 9 estados reales (incluye CANCELADO/NO_REPARABLE);
 * este módulo solo usa estos 6.
 */
const ESTADOS_TARJETA = [
  'RECIBIDO',
  'DIAGNOSTICO',
  'ESPERANDO_APROBACION',
  'EN_REPARACION',
  'LISTO_ENTREGA',
  'ENTREGADO',
] as const;

function formatFecha(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function truncar(texto: string | null | undefined, max = 50) {
  if (!texto) return '—';
  return texto.length > max ? `${texto.slice(0, max)}…` : texto;
}

/** Fecha de asignación a mostrar: la del técnico filtrado si hay uno,
 * si no la del técnico PRINCIPAL, si no la más antigua registrada. */
function fechaAsignacionRelevante(orden: OrdenReparacion, tecnicoIdFiltro?: number) {
  const asignaciones = orden.ordenTecnicos;
  if (asignaciones.length === 0) return null;

  if (tecnicoIdFiltro) {
    const match = asignaciones.find((a) => a.usuarioId === tecnicoIdFiltro);
    if (match) return match.fechaAsignacion;
  }

  const principal = asignaciones.find((a) => a.tipoParticipacion === 'PRINCIPAL');
  if (principal) return principal.fechaAsignacion;

  return asignaciones.reduce(
    (min, a) => (!min || (a.fechaAsignacion && a.fechaAsignacion < min) ? a.fechaAsignacion : min),
    asignaciones[0].fechaAsignacion,
  );
}

function tecnicosTexto(orden: OrdenReparacion) {
  if (orden.ordenTecnicos.length === 0) return '—';
  return orden.ordenTecnicos.map((a) => `${a.usuario.nombre} ${a.usuario.apellido ?? ''}`.trim()).join(', ');
}

function SeguimientoPanelContent() {
  const { rolNombre } = useAuth();
  const esAdmin = rolNombre === 'Administrador';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [estadoId, setEstadoId] = useState<number | undefined>(undefined);
  const [tecnicoId, setTecnicoId] = useState<number | undefined>(undefined);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const { data: tecnicos } = useTecnicos();

  const filtrosBase = {
    search: search || undefined,
    tecnicoId: esAdmin ? tecnicoId : undefined, // si no es admin, el backend ya fuerza su propio id igual
    fechaInicio: fechaInicio || undefined,
    fechaFin: fechaFin || undefined,
  };

  const { data: conteo, isLoading: isLoadingConteo } = useConteoPorEstado(filtrosBase);
  const { data, isLoading, isFetching, error } = useReparaciones({
    page,
    limit: LIMIT,
    estadoId,
    ...filtrosBase,
  });

  const conteoPorNombre = useMemo(() => {
    const map = new Map<string, number>();
    conteo?.forEach((c) => map.set(c.nombre, c.cantidad));
    return map;
  }, [conteo]);

  const estadoIdPorNombre = useMemo(() => {
    const map = new Map<string, number>();
    conteo?.forEach((c) => map.set(c.nombre, c.estadoId));
    return map;
  }, [conteo]);

  if (error instanceof ApiError && error.statusCode === 403) {
    return <AccessDenied />;
  }

  function handleEstadoCardClick(nombre: string) {
    const id = estadoIdPorNombre.get(nombre);
    setEstadoId((prev) => (prev === id ? undefined : id));
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const columns: Column<OrdenReparacion>[] = [
    {
      key: 'codigoOrden',
      header: 'Orden',
      render: (row) => (
        <a href={`/reparaciones/${row.id}`} className="font-medium text-graphite-900 hover:underline">
          {row.codigoOrden}
        </a>
      ),
    },
    {
      key: 'equipo',
      header: 'Equipo',
      render: (row) => [row.equipo.tipoEquipo, row.equipo.marca, row.equipo.modelo].filter(Boolean).join(' '),
    },
    { key: 'tecnico', header: 'Técnico', render: (row) => tecnicosTexto(row) },
    { key: 'fallaReportada', header: 'Falla reportada', render: (row) => truncar(row.fallaReportada) },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => (
        <Badge label={estadoOrdenLabel(row.estado.nombre)} className={estadoOrdenClasses(row.estado.nombre)} />
      ),
    },
    {
      key: 'fechaAsignacion',
      header: 'Fecha de asignación',
      render: (row) => formatFecha(fechaAsignacionRelevante(row, esAdmin ? tecnicoId : undefined)),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ESTADOS_TARJETA.map((nombre) => (
          <EstadoCard
            key={nombre}
            label={estadoOrdenLabel(nombre)}
            cantidad={conteoPorNombre.get(nombre)}
            isLoading={isLoadingConteo}
            active={estadoId === estadoIdPorNombre.get(nombre)}
            onClick={() => handleEstadoCardClick(nombre)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Buscar por código o falla…" />

        {esAdmin && (
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Técnico</label>
            <select
              value={tecnicoId ?? ''}
              onChange={(e) => {
                setTecnicoId(e.target.value ? Number(e.target.value) : undefined);
                setPage(1);
              }}
              className="rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            >
              <option value="">Todos</option>
              {tecnicos?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} {t.apellido ?? ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-graphite-900">Desde</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => {
              setFechaInicio(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-graphite-900">Hasta</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => {
              setFechaFin(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        {(estadoId || tecnicoId || fechaInicio || fechaFin || search) && (
          <button
            type="button"
            onClick={() => {
              setEstadoId(undefined);
              setTecnicoId(undefined);
              setFechaInicio('');
              setFechaFin('');
              setSearch('');
              setPage(1);
            }}
            className="text-sm font-medium text-graphite-500 hover:text-graphite-900 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        emptyMessage="No se encontraron órdenes para estos filtros."
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

export default function SeguimientoPanel() {
  return (
    <QueryProvider>
      <SeguimientoPanelContent />
    </QueryProvider>
  );
}
