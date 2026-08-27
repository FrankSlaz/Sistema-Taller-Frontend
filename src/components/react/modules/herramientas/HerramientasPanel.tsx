import { ArrowLeftRight, Eye, Pencil, Plus, Undo2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import Pagination from '../../ui/Pagination';
import Badge from '../../ui/Badge';
import SearchInput from '../../filters/SearchInput';
import HerramientaFormModal from '../../forms/HerramientaFormModal';
import AsignarHerramientaFormModal from '../../forms/AsignarHerramientaFormModal';
import HerramientaDetailModal from './HerramientaDetailModal';
import QueryProvider from '../../providers/QueryProvider';
import { useHerramientaMutations, useHerramientas } from '../../../../lib/hooks/useHerramientas';
import { useAsignaciones } from '../../../../lib/hooks/useAsignaciones';
import { estadoHerramientaClasses, estadoHerramientaLabel } from '../../../../lib/utils/estado';
import { ESTADOS_HERRAMIENTA, type Herramienta } from '../../../../types/herramienta';
import { usePermiso } from '../../../../lib/hooks/useAuth';

const LIMIT = 10;

function formatMonto(value?: string | number | null) {
  if (value === null || value === undefined) return '—';
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? `Bs ${num.toFixed(2)}` : '—';
}

function HerramientasPanelContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [formState, setFormState] = useState<{ open: boolean; herramienta: Herramienta | null }>({
    open: false,
    herramienta: null,
  });
  const [asignarTarget, setAsignarTarget] = useState<Herramienta | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data, isLoading, isFetching } = useHerramientas({ page, limit: LIMIT, search, estado: estado || undefined });
  const { devolver } = useHerramientaMutations();
  const puedeCrear = usePermiso('herramientas:crear');
  const puedeEditar = usePermiso('herramientas:editar');

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleEstadoChange(value: string) {
    setEstado(value);
    setPage(1);
  }
  // Trae las asignaciones activas una sola vez para resolver el botón "Devolver"
  // por fila sin hacer una petición extra por cada herramienta asignada.
  const { data: activas } = useAsignaciones({ activas: true, limit: 100 });

  const asignacionPorHerramienta = useMemo(() => {
    const map = new Map<number, number>();
    activas?.items.forEach((a) => map.set(a.herramientaId, a.id));
    return map;
  }, [activas]);

  const columns: Column<Herramienta>[] = [
    {
      key: 'nombre',
      header: 'Herramienta',
      render: (row) => (
        <div>
          <p className="font-medium text-graphite-900">{row.nombre}</p>
          {(row.marca || row.modelo) && (
            <p className="text-xs text-graphite-400">{[row.marca, row.modelo].filter(Boolean).join(' ')}</p>
          )}
        </div>
      ),
    },
    { key: 'numeroSerie', header: 'N.º de serie', render: (row) => row.numeroSerie ?? '—' },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => (
        <Badge label={estadoHerramientaLabel(row.estado)} className={estadoHerramientaClasses(row.estado)} />
      ),
    },
    { key: 'costo', header: 'Costo', render: (row) => formatMonto(row.costo) },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (row) => {
        const asignacionId = asignacionPorHerramienta.get(row.id);
        return (
          <div className="flex justify-end gap-1">
            {row.estado === 'DISPONIBLE' && puedeEditar && (
              <button
                type="button"
                onClick={() => setAsignarTarget(row)}
                className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
                aria-label={`Asignar ${row.nombre}`}
                title="Asignar"
              >
                <ArrowLeftRight size={15} />
              </button>
            )}
            {row.estado === 'ASIGNADA' && asignacionId && puedeEditar && (
              <button
                type="button"
                onClick={() => devolver.mutate(asignacionId)}
                disabled={devolver.isPending}
                className="rounded-md p-1.5 text-graphite-400 hover:bg-blue-50 hover:text-blue-700"
                aria-label={`Registrar devolución de ${row.nombre}`}
                title="Registrar devolución"
              >
                <Undo2 size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setDetailId(row.id)}
              className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
              aria-label={`Ver detalle de ${row.nombre}`}
              title="Ver detalle"
            >
              <Eye size={15} />
            </button>
            {puedeEditar && (
              <button
                type="button"
                onClick={() => setFormState({ open: true, herramienta: row })}
                className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
                aria-label={`Editar ${row.nombre}`}
              >
                <Pencil size={15} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar por nombre, marca, modelo o serie…"
          />

          <select
            value={estado}
            onChange={(e) => handleEstadoChange(e.target.value)}
            className="rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          >
            <option value="">Todos los estados</option>
            {ESTADOS_HERRAMIENTA.map((e) => (
              <option key={e} value={e}>
                {estadoHerramientaLabel(e)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setFormState({ open: true, herramienta: null })}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
          hidden={!puedeCrear}
        >
          <Plus size={16} />
          Nueva herramienta
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        emptyMessage="No se encontraron herramientas."
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

      <HerramientaFormModal
        open={formState.open}
        herramienta={formState.herramienta}
        onClose={() => setFormState({ open: false, herramienta: null })}
      />

      <AsignarHerramientaFormModal
        open={!!asignarTarget}
        herramienta={asignarTarget}
        onClose={() => setAsignarTarget(null)}
      />

      <HerramientaDetailModal
        herramientaId={detailId}
        onClose={() => setDetailId(null)}
        onAsignar={(id) => {
          const h = data?.items.find((item) => item.id === id);
          if (h) setAsignarTarget(h);
          setDetailId(null);
        }}
      />
    </div>
  );
}

export default function HerramientasPanel() {
  return (
    <QueryProvider>
      <HerramientasPanelContent />
    </QueryProvider>
  );
}
