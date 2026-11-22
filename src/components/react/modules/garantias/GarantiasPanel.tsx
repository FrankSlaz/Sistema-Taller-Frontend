import { useEffect, useState } from 'react';
import Pagination from '../../ui/Pagination';
import Badge from '../../ui/Badge';
import QueryProvider from '../../providers/QueryProvider';
import { useGarantias } from '../../../../lib/hooks/useGarantias';
import { estadoGarantiaClasses, estadoGarantiaLabel } from '../../../../lib/utils/estado';
import type { FiltroGarantia } from '../../../../types/garantia';
import { FiltroTexto, Tabla } from '../reportes/compartido';

const LIMIT = 15;

function formatFecha(value: string) {
  return new Date(value).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

const FILTROS: { valor: FiltroGarantia | ''; etiqueta: string; clave?: 'activas' | 'porVencer' | 'vencidas' | 'anuladas' }[] = [
  { valor: '', etiqueta: 'Todas' },
  { valor: 'ACTIVA', etiqueta: 'Activas', clave: 'activas' },
  { valor: 'POR_VENCER', etiqueta: 'Por vencer (7 días)', clave: 'porVencer' },
  { valor: 'VENCIDA', etiqueta: 'Vencidas', clave: 'vencidas' },
  { valor: 'ANULADA', etiqueta: 'Anuladas', clave: 'anuladas' },
];

/**
 * Garantías: se crean solas al entregar y vencen solas. Desde acá se
 * filtran (por vencer para avisar a tiempo) y se abre la orden para
 * atender un reclamo.
 */
function GarantiasPanelContent() {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<FiltroGarantia | ''>('ACTIVA');
  const [busqueda, setBusqueda] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(busqueda.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [busqueda]);

  const { data, isLoading, isFetching } = useGarantias({
    page,
    limit: LIMIT,
    estado: estado || undefined,
    search: search || undefined,
  });
  const resumen = data?.resumen;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTROS.map((f) => {
            const activo = estado === f.valor;
            const n = f.clave && resumen ? resumen[f.clave] : null;
            return (
              <button
                key={f.etiqueta}
                type="button"
                onClick={() => {
                  setEstado(f.valor);
                  setPage(1);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  activo
                    ? 'border-graphite-900 bg-graphite-900 text-white'
                    : f.valor === 'POR_VENCER' && n
                      ? 'border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-400'
                      : 'border-graphite-200 bg-white text-graphite-600 hover:border-graphite-400'
                }`}
              >
                {f.etiqueta}
                {n !== null && <span className="ml-1.5 font-semibold">{n}</span>}
              </button>
            );
          })}
        </div>
        <FiltroTexto label="Buscar" valor={busqueda} onChange={setBusqueda} placeholder="Orden o cliente…" />
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-lg bg-graphite-100" />
      ) : (
        <Tabla
          clave={(g) => g.id}
          filas={data?.items ?? []}
          vacio="No hay garantías con este filtro."
          tono={(g) => (g.porVencer ? 'alerta' : undefined)}
          columnas={[
            {
              titulo: 'Orden',
              render: (g) => (
                <a href={`/reparaciones/${g.ordenId}`} className="font-medium text-graphite-900 hover:underline">
                  {g.orden?.codigoOrden ?? `#${g.ordenId}`}
                </a>
              ),
              className: 'whitespace-nowrap',
            },
            {
              titulo: 'Cliente',
              render: (g) => (
                <>
                  <p>{g.orden?.cliente?.nombre ?? '—'}</p>
                  {g.orden?.cliente?.telefono && <p className="text-xs text-graphite-400">{g.orden.cliente.telefono}</p>}
                </>
              ),
            },
            {
              titulo: 'Equipo',
              render: (g) => [g.orden?.equipo?.tipoEquipo, g.orden?.equipo?.marca, g.orden?.equipo?.modelo].filter(Boolean).join(' ') || '—',
            },
            { titulo: 'Días', alinear: 'right', render: (g) => g.dias },
            { titulo: 'Vence', render: (g) => formatFecha(g.fechaFin), className: 'whitespace-nowrap' },
            {
              titulo: 'Quedan',
              alinear: 'right',
              render: (g) =>
                g.diasRestantes === null || g.diasRestantes === undefined ? (
                  '—'
                ) : (
                  <span className={g.porVencer ? 'font-semibold text-amber-700' : ''}>
                    {g.diasRestantes === 0 ? 'Hoy' : `${g.diasRestantes} d`}
                  </span>
                ),
            },
            {
              titulo: 'Reclamos',
              render: (g) =>
                g.reclamos?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {g.reclamos.map((r) => (
                      <a key={r.id} href={`/reparaciones/${r.id}`} className="text-xs font-medium text-graphite-900 hover:underline">
                        {r.codigoOrden}
                      </a>
                    ))}
                  </div>
                ) : (
                  <span className="text-graphite-400">—</span>
                ),
            },
            {
              titulo: 'Estado',
              render: (g) => {
                const e = String(g.estadoEfectivo ?? g.estado);
                return <Badge label={estadoGarantiaLabel(e)} className={estadoGarantiaClasses(e)} />;
              },
            },
          ]}
        />
      )}
      {isFetching && !isLoading && <p className="text-xs text-graphite-400">Actualizando…</p>}

      {data && data.meta.totalPages > 1 && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} onPageChange={setPage} />
      )}
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
