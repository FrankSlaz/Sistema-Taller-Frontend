import { useMutation, useQuery } from '@tanstack/react-query';
import { Ban, FileDown, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import Pagination from '../../ui/Pagination';
import AccessDenied from '../../ui/AccessDenied';
import MotivoDialog from '../../ui/MotivoDialog';
import PagoFormModal from '../../forms/PagoFormModal';
import QueryProvider from '../../providers/QueryProvider';
import { usePagoMutations, usePagos } from '../../../../lib/hooks/usePagos';
import { useAuth, usePermiso } from '../../../../lib/hooks/useAuth';
import { usuariosApi } from '../../../../lib/api/usuarios';
import { pagosApi } from '../../../../lib/api/pagos';
import { ApiError } from '../../../../lib/api/client';
import { METODOS_PAGO, type Pago, type TipoPago } from '../../../../types/pago';
import type { RangoFechas } from '../../../../types/reporte';
import {
  FiltroFechas,
  FiltroSelect,
  FiltroTexto,
  KpiGrid,
  Seccion,
  Tabla,
  bs,
  presetRango,
} from '../reportes/compartido';

const LIMIT = 20;
const msg = (e: unknown) => (e instanceof ApiError ? e.message : e ? 'Error inesperado' : null);

function formatFechaHora(value: string) {
  return new Date(value).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Caja: pagos con filtros (por defecto, los de hoy) y el resumen para
 * cuadrar: ingresos, devoluciones, neto y totales por método de pago.
 */
function PagosGlobalPanelContent() {
  const [page, setPage] = useState(1);
  const [rango, setRango] = useState<RangoFechas>(presetRango('hoy'));
  const [metodoPago, setMetodoPago] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [tipo, setTipo] = useState('');
  const [incluirAnulados, setIncluirAnulados] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(busqueda.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [busqueda]);
  const [formOpen, setFormOpen] = useState(false);
  const [anularTarget, setAnularTarget] = useState<Pago | null>(null);

  const { rolNombre } = useAuth();
  const esAdmin = rolNombre === 'Administrador';
  const { data, isLoading, isFetching, error } = usePagos({
    page,
    limit: LIMIT,
    // Al buscar se miran todas las fechas: se busca un pago concreto.
    ...(search ? {} : rango),
    search: search || undefined,
    metodoPago: metodoPago || undefined,
    usuarioId: usuarioId ? Number(usuarioId) : undefined,
    tipo: (tipo || undefined) as TipoPago | undefined,
    incluirAnulados,
  });
  // Lista de usuarios para el filtro (solo Administrador puede listarlos).
  const { data: usuarios } = useQuery({
    queryKey: ['usuarios', 'todos'],
    queryFn: () => usuariosApi.findAll('todos'),
    enabled: esAdmin,
    retry: false,
  });
  const { anular } = usePagoMutations();
  const recibo = useMutation({ mutationFn: (p: Pago) => pagosApi.recibo(p) });

  const puedeCrear = usePermiso('pagos:crear');
  const puedeAnular = usePermiso('pagos:eliminar');

  if (error instanceof ApiError && error.statusCode === 403) return <AccessDenied />;

  const cambiar = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };
  const caja = data?.caja;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-graphite-200 bg-graphite-50/60 p-3">
        <FiltroTexto
          label="Buscar"
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="Orden, cliente, recibo, referencia…"
        />
        <FiltroFechas valor={rango} onChange={cambiar(setRango)} permitirTodo />
        <FiltroSelect
          label="Método"
          valor={metodoPago}
          onChange={cambiar(setMetodoPago)}
          opciones={METODOS_PAGO.map((m) => ({ valor: m, etiqueta: m }))}
        />
        <FiltroSelect
          label="Tipo"
          valor={tipo}
          onChange={cambiar(setTipo)}
          opciones={[
            { valor: 'PAGO', etiqueta: 'Pagos' },
            { valor: 'DEVOLUCION', etiqueta: 'Devoluciones' },
          ]}
        />
        {esAdmin && usuarios && (
          <FiltroSelect
            label="Registrado por"
            valor={usuarioId}
            onChange={cambiar(setUsuarioId)}
            opciones={usuarios.map((u) => ({ valor: String(u.id), etiqueta: `${u.nombre} ${u.apellido ?? ''}`.trim() }))}
          />
        )}
        <label className="mb-2 flex items-center gap-2 text-sm text-graphite-700">
          <input type="checkbox" checked={incluirAnulados} onChange={(e) => cambiar(setIncluirAnulados)(e.target.checked)} />
          Mostrar anulados
        </label>
        {search && <span className="mb-2 text-xs text-graphite-500">La búsqueda incluye todas las fechas.</span>}
        {puedeCrear && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-graphite-900 px-3 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
          >
            <Plus size={15} />
            Registrar pago
          </button>
        )}
      </div>

      {caja && (
        <KpiGrid
          kpis={[
            { label: 'Neto en caja', valor: bs(caja.neto), detalle: 'Ingresos − devoluciones', tono: 'bueno' },
            { label: 'Ingresos', valor: bs(caja.ingresos), detalle: `${caja.cantidadIngresos} pagos` },
            { label: 'Devoluciones', valor: bs(caja.devoluciones), detalle: `${caja.cantidadDevoluciones} devoluciones`, tono: caja.devoluciones ? 'alerta' : 'neutral' },
            { label: 'Anulados', valor: bs(caja.anulados), detalle: `${caja.cantidadAnulados} (no cuentan)`, tono: caja.cantidadAnulados ? 'malo' : 'neutral' },
          ]}
        />
      )}

      {caja && caja.porMetodo.length > 0 && (
        <Seccion titulo="Por método de pago" descripcion="Neto de cada medio, para cuadrar efectivo, QR y tarjeta.">
          <div className="flex flex-wrap gap-2">
            {caja.porMetodo.map((m) => (
              <div key={m.metodoPago} className="rounded-lg border border-graphite-200 bg-white px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-graphite-400">{m.metodoPago}</p>
                <p className="font-display text-lg font-semibold tabular-nums text-graphite-900">{bs(m.neto)}</p>
              </div>
            ))}
          </div>
        </Seccion>
      )}

      {msg(recibo.error) && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{msg(recibo.error)}</p>}

      <Seccion titulo={`Movimientos${isFetching && !isLoading ? ' …' : ''}`}>
        {isLoading ? (
          <div className="h-48 animate-pulse rounded-lg bg-graphite-100" />
        ) : (
          <Tabla
            clave={(p) => p.id}
            filas={data?.items ?? []}
            vacio="No hay pagos con estos filtros."
            tono={(p) => (p.anulado ? 'malo' : p.tipo === 'DEVOLUCION' ? 'alerta' : undefined)}
            columnas={[
              { titulo: 'Fecha', render: (p) => formatFechaHora(p.fecha), className: 'whitespace-nowrap' },
              { titulo: 'N.º', render: (p) => pagosApi.numeroRecibo(p), className: 'whitespace-nowrap font-mono text-xs' },
              {
                titulo: 'Orden',
                render: (p) =>
                  p.orden ? (
                    <a href={`/reparaciones/${p.orden.id}`} className="font-medium text-graphite-900 hover:underline">
                      {p.orden.codigoOrden}
                    </a>
                  ) : (
                    '—'
                  ),
              },
              { titulo: 'Cliente', render: (p) => p.orden?.cliente?.nombre ?? '—' },
              { titulo: 'Método', render: (p) => p.metodoPago ?? '—' },
              { titulo: 'Registró', render: (p) => p.usuario?.nombre ?? '—' },
              {
                titulo: 'Monto',
                alinear: 'right',
                render: (p) => (
                  <span className={p.anulado ? 'text-graphite-400 line-through' : 'font-semibold'}>
                    {p.tipo === 'DEVOLUCION' ? '− ' : ''}
                    {bs(Number(p.monto))}
                  </span>
                ),
              },
              {
                titulo: '',
                render: (p) => (
                  <div className="flex justify-end gap-0.5">
                    <button
                      type="button"
                      onClick={() => recibo.mutate(p)}
                      className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-100 hover:text-graphite-900"
                      aria-label="Recibo"
                      title={p.anulado ? `Anulado: ${p.motivoAnulacion ?? ''}` : 'Recibo (PDF)'}
                    >
                      <FileDown size={14} />
                    </button>
                    {!p.anulado && puedeAnular && (
                      <button
                        type="button"
                        onClick={() => setAnularTarget(p)}
                        className="rounded-md p-1.5 text-graphite-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Anular"
                        title="Anular"
                      >
                        <Ban size={14} />
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
        {data && data.meta.totalPages > 1 && (
          <Pagination page={page} totalPages={data.meta.totalPages} total={data.meta.total} onPageChange={setPage} />
        )}
      </Seccion>

      <PagoFormModal open={formOpen} onClose={() => setFormOpen(false)} />

      <MotivoDialog
        open={!!anularTarget}
        onClose={() => setAnularTarget(null)}
        title="Anular movimiento"
        description={`Se anulará ${anularTarget ? bs(Number(anularTarget.monto)) : ''} de la orden ${anularTarget?.orden?.codigoOrden ?? ''}. Quedará tachado y dejará de contar en la caja y en el saldo de la orden.`}
        confirmLabel="Anular"
        isLoading={anular.isPending}
        error={msg(anular.error)}
        onConfirm={(motivo) =>
          anularTarget && anular.mutate({ id: anularTarget.id, motivo }, { onSuccess: () => setAnularTarget(null) })
        }
      />
    </div>
  );
}

export default function PagosGlobalPanel() {
  return (
    <QueryProvider>
      <PagosGlobalPanelContent />
    </QueryProvider>
  );
}
