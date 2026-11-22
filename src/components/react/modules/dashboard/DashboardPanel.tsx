import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  PackageCheck,
  PackageMinus,
  Plus,
  ShieldCheck,
  Siren,
  Wallet,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import Badge from '../../ui/Badge';
import Tip from '../../ui/Tip';
import QueryProvider from '../../providers/QueryProvider';
import { useAuth, usePermiso } from '../../../../lib/hooks/useAuth';
import { useInicio } from '../../../../lib/hooks/useDashboard';
import { ApiError } from '../../../../lib/api/client';
import { estadoOrdenClasses, estadoOrdenLabel, prioridadClasses } from '../../../../lib/utils/estado';
import type { Inicio, ItemOrden, Lista, ProductoBajo } from '../../../../types/dashboard';

// ---------------------------------------------------------------------------
// Formato
// ---------------------------------------------------------------------------

const bs = (n: number) => `Bs ${n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const entero = (n: number) => n.toLocaleString('es-BO');
const pl = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

function saludo() {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

function fechaLarga() {
  const t = new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** "2026-11-22" (día local) -> Date local. */
const diaLocal = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// ---------------------------------------------------------------------------
// Piezas
// ---------------------------------------------------------------------------

type Tono = 'neutral' | 'bueno' | 'alerta' | 'malo';
const TONO_KPI: Record<Tono, string> = {
  neutral: 'border-graphite-200 bg-white',
  bueno: 'border-green-200 bg-green-50',
  alerta: 'border-amber-200 bg-amber-50',
  malo: 'border-red-200 bg-red-50',
};
const TONO_VALOR: Record<Tono, string> = {
  neutral: 'text-graphite-900',
  bueno: 'text-green-800',
  alerta: 'text-amber-900',
  malo: 'text-red-800',
};

function Kpi({
  label,
  valor,
  detalle,
  tono = 'neutral',
  href,
  icono: Icono,
}: {
  label: string;
  valor: string;
  detalle?: ReactNode;
  tono?: Tono;
  href?: string;
  icono: LucideIcon;
}) {
  const cuerpo = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-graphite-500">{label}</p>
        <Icono size={16} className="shrink-0 text-graphite-400" aria-hidden />
      </div>
      <p className={`mt-1.5 font-display text-2xl font-semibold tabular-nums ${TONO_VALOR[tono]}`}>{valor}</p>
      {detalle && <div className="mt-0.5 text-xs text-graphite-500">{detalle}</div>}
    </>
  );
  const clase = `block rounded-lg border p-4 ${TONO_KPI[tono]}`;
  return href ? (
    <a href={href} className={`${clase} transition hover:border-graphite-400 hover:shadow-sm`}>
      {cuerpo}
    </a>
  ) : (
    <div className={clase}>{cuerpo}</div>
  );
}

function Seccion({ titulo, extra, children }: { titulo: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-graphite-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-graphite-100 px-4 py-3">
        <h2 className="font-display text-base font-semibold text-graphite-900">{titulo}</h2>
        {extra}
      </div>
      {children}
    </section>
  );
}

const TONO_ALERTA = {
  malo: { borde: 'border-l-red-500', icono: 'bg-red-50 text-red-700', cuenta: 'bg-red-600 text-white' },
  alerta: { borde: 'border-l-amber-500', icono: 'bg-amber-50 text-amber-700', cuenta: 'bg-amber-500 text-white' },
  info: { borde: 'border-l-blue-500', icono: 'bg-blue-50 text-blue-700', cuenta: 'bg-blue-600 text-white' },
};

/** Una alerta de "Requiere atención": título, cuántas son y las primeras. */
function Alerta<T>({
  titulo,
  descripcion,
  icono: Icono,
  tono,
  lista,
  clave,
  fila,
  verTodas,
}: {
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
  tono: keyof typeof TONO_ALERTA;
  lista: Lista<T>;
  clave: (x: T) => number | string;
  fila: (x: T) => ReactNode;
  verTodas?: string;
}) {
  const t = TONO_ALERTA[tono];
  return (
    <div className={`rounded-md border border-graphite-200 border-l-4 ${t.borde} bg-white`}>
      <div className="flex items-start gap-3 px-3 pt-3">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${t.icono}`}>
          <Icono size={16} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold text-graphite-900">
            {titulo}
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${t.cuenta}`}>{lista.total}</span>
          </p>
          <p className="text-xs text-graphite-500">{descripcion}</p>
        </div>
      </div>
      <ul className="mt-2 divide-y divide-graphite-100">
        {lista.items.map((x) => (
          <li key={clave(x)}>{fila(x)}</li>
        ))}
      </ul>
      {verTodas && lista.total > lista.items.length && (
        <a href={verTodas} className="block border-t border-graphite-100 px-3 py-2 text-xs font-medium text-graphite-600 hover:bg-graphite-50 hover:text-graphite-900">
          Ver las {lista.total} →
        </a>
      )}
    </div>
  );
}

/** Fila de una orden dentro de una alerta: código, cliente, equipo y un dato a la derecha. */
function FilaOrden({ o, derecha }: { o: ItemOrden; derecha: ReactNode }) {
  return (
    <a href={`/reparaciones/${o.id}`} className="flex items-center gap-3 px-3 py-2 hover:bg-graphite-50">
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-graphite-900">{o.codigoOrden}</span>
          {o.prioridad && o.prioridad !== 'NORMAL' && <Badge label={o.prioridad} className={prioridadClasses(o.prioridad)} />}
        </span>
        <span className="block truncate text-xs text-graphite-500">
          {o.cliente} · {o.equipo}
        </span>
      </span>
      <span className="shrink-0 text-right text-xs">{derecha}</span>
      <ChevronRight size={14} className="shrink-0 text-graphite-300" aria-hidden />
    </a>
  );
}

// ---------------------------------------------------------------------------
// Bloques
// ---------------------------------------------------------------------------

function RequiereAtencion({ d }: { d: Inicio }) {
  const a = d.atencion;
  const u = d.umbrales;
  const alertas: ReactNode[] = [];

  if (a.urgentesSinTecnico?.total)
    alertas.push(
      <Alerta
        key="urgentes"
        titulo="Urgentes sin técnico"
        descripcion="Prioridad urgente y nadie asignado."
        icono={Siren}
        tono="malo"
        lista={a.urgentesSinTecnico}
        clave={(o) => o.id}
        fila={(o) => (
          <FilaOrden o={o} derecha={<span className="text-graphite-500">{o.dias ? `Ingresó hace ${pl(o.dias, 'día', 'días')}` : 'Ingresó hoy'}</span>} />
        )}
      />,
    );
  if (a.promesaVencida?.total)
    alertas.push(
      <Alerta
        key="promesa"
        titulo="Fecha prometida vencida"
        descripcion="En el taller, con la fecha prometida al cliente vencida o para hoy."
        icono={CalendarClock}
        tono="malo"
        lista={a.promesaVencida}
        clave={(o) => o.id}
        fila={(o) => (
          <FilaOrden
            o={o}
            derecha={
              o.dias ? (
                <span className="font-semibold text-red-700">Atrasada {pl(o.dias, 'día', 'días')}</span>
              ) : (
                <span className="font-semibold text-amber-700">Vence hoy</span>
              )
            }
          />
        )}
      />,
    );
  if (a.sinRetirar?.total)
    alertas.push(
      <Alerta
        key="retirar"
        titulo="Equipos sin retirar"
        descripcion={`Listos para entrega hace ${u.diasSinRetirar} días o más: avisa al cliente.`}
        icono={PackageCheck}
        tono="alerta"
        lista={a.sinRetirar}
        clave={(o) => o.id}
        verTodas={d.embudo ? `/reparaciones?estadoId=${d.embudo.estados.find((e) => e.estado === 'LISTO_ENTREGA')?.estadoId ?? ''}` : undefined}
        fila={(o) => (
          <FilaOrden
            o={o}
            derecha={
              <>
                <span className="block text-graphite-600">Hace {pl(o.dias ?? 0, 'día', 'días')}</span>
                {o.saldo !== undefined &&
                  (o.saldo > 0 ? (
                    <span className="block font-semibold text-red-700">Debe {bs(o.saldo)}</span>
                  ) : (
                    <span className="block text-green-700">Pagado</span>
                  ))}
              </>
            }
          />
        )}
      />,
    );
  if (a.presupuestosSinRespuesta?.total)
    alertas.push(
      <Alerta
        key="presupuestos"
        titulo="Presupuestos sin respuesta"
        descripcion={`Pendientes de aprobación hace ${u.diasSinRespuesta} días o más: vuelve a contactar al cliente.`}
        icono={FileText}
        tono="alerta"
        lista={a.presupuestosSinRespuesta}
        clave={(o) => `${o.id}-${o.monto}-${o.dias}`}
        verTodas="/presupuestos"
        fila={(o) => (
          <FilaOrden
            o={o}
            derecha={
              <>
                <span className="block font-semibold text-graphite-900">{bs(o.monto ?? 0)}</span>
                <span className="block text-graphite-500">hace {pl(o.dias ?? 0, 'día', 'días')}</span>
              </>
            }
          />
        )}
      />,
    );
  if (a.garantiasPorVencer?.total)
    alertas.push(
      <Alerta
        key="garantias"
        titulo="Garantías por vencer"
        descripcion="Vencen en los próximos 7 días."
        icono={ShieldCheck}
        tono="info"
        lista={a.garantiasPorVencer}
        clave={(o) => o.id}
        verTodas="/garantias"
        fila={(o) => (
          <FilaOrden o={o} derecha={<span className="text-graphite-600">{o.dias ? `En ${pl(o.dias, 'día', 'días')}` : 'Vence hoy'}</span>} />
        )}
      />,
    );
  if (a.stockBajo?.total)
    alertas.push(
      <Alerta<ProductoBajo>
        key="stock"
        titulo="Stock bajo"
        descripcion="Productos en el mínimo o por debajo."
        icono={PackageMinus}
        tono="info"
        lista={a.stockBajo}
        clave={(p) => p.id}
        verTodas="/inventario"
        fila={(p) => (
          <a href="/inventario" className="flex items-center gap-3 px-3 py-2 hover:bg-graphite-50">
            <span className="min-w-0 flex-1 truncate text-sm text-graphite-900">{p.nombre}</span>
            <span className="shrink-0 text-xs tabular-nums text-red-700">
              {p.stockActual ?? 0} <span className="text-graphite-400">/ mín. {p.stockMinimo ?? 0}</span>
            </span>
          </a>
        )}
      />,
    );

  return (
    <Seccion
      titulo="Requiere atención"
      extra={alertas.length > 0 && <span className="text-xs text-graphite-400">Se actualiza cada minuto</span>}
    >
      {alertas.length ? (
        <div className="grid grid-cols-1 gap-3 p-3 xl:grid-cols-2">{alertas}</div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-8 text-sm text-graphite-600">
          <CheckCircle2 size={22} className="text-green-600" aria-hidden />
          <span>
            <strong className="text-graphite-900">Todo al día.</strong> No hay equipos sin retirar, promesas vencidas ni
            pendientes urgentes.
          </span>
        </div>
      )}
    </Seccion>
  );
}

function MisOrdenes({ mias }: { mias: NonNullable<Inicio['mias']> }) {
  return (
    <Seccion titulo="Mis órdenes" extra={<span className="text-xs text-graphite-500">{pl(mias.total, 'en curso', 'en curso')}</span>}>
      {mias.items.length === 0 ? (
        <p className="px-4 py-8 text-sm text-graphite-500">No tienes órdenes asignadas en curso.</p>
      ) : (
        <ul className="divide-y divide-graphite-100">
          {mias.items.map((o) => (
            <li key={o.id}>
              <FilaOrden
                o={o}
                derecha={
                  <span className="flex flex-col items-end gap-1">
                    <Badge label={estadoOrdenLabel(o.estado)} className={estadoOrdenClasses(o.estado)} />
                    {o.fechaPromesa && (
                      <span className="text-graphite-500">
                        Promesa {new Date(o.fechaPromesa).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                  </span>
                }
              />
            </li>
          ))}
        </ul>
      )}
      {mias.total > mias.items.length && (
        <a href="/seguimiento" className="block border-t border-graphite-100 px-4 py-2 text-xs font-medium text-graphite-600 hover:bg-graphite-50">
          Ver todas en Seguimiento →
        </a>
      )}
    </Seccion>
  );
}

/** Órdenes en el taller por estado: barras de una sola serie (longitud = cantidad). */
function EnElTaller({ embudo }: { embudo: NonNullable<Inicio['embudo']> }) {
  const max = Math.max(1, ...embudo.estados.map((e) => e.cantidad));
  return (
    <Seccion titulo="En el taller" extra={<span className="text-xs text-graphite-500">{pl(embudo.total, 'orden', 'órdenes')}</span>}>
      <ul className="space-y-1 p-3">
        {embudo.estados.map((e) => (
          <li key={e.estadoId}>
            <a
              href={`/reparaciones?estadoId=${e.estadoId}`}
              className="grid grid-cols-[8.5rem_1fr_2rem] items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-graphite-50"
            >
              <span className="truncate text-xs text-graphite-700">{e.etiqueta}</span>
              <span className="h-2 rounded-full bg-graphite-100" aria-hidden>
                <span
                  className="block h-2 rounded-full bg-graphite-700"
                  style={{ width: e.cantidad ? `${Math.max(4, (e.cantidad / max) * 100)}%` : 0 }}
                />
              </span>
              <span className="text-right text-xs font-semibold tabular-nums text-graphite-900">{e.cantidad}</span>
            </a>
          </li>
        ))}
      </ul>
    </Seccion>
  );
}

/** Ingresos netos por día (14 días): barras con etiqueta al pasar el mouse. */
function Tendencia({ t }: { t: NonNullable<Inicio['tendencia']> }) {
  const max = Math.max(1, ...t.dias.map((d) => d.neto));
  const hoy = t.dias.at(-1)?.fecha;
  return (
    <Seccion titulo="Ingresos de los últimos 14 días" extra={<span className="text-xs font-semibold text-graphite-700">{bs(t.total)}</span>}>
      <div className="px-4 pb-3 pt-4">
        <div className="flex h-36 items-end gap-[2px] border-b border-graphite-200" role="img" aria-label={`Ingresos de los últimos 14 días: ${bs(t.total)} en total`}>
          {t.dias.map((d) => {
            const fecha = diaLocal(d.fecha);
            const etiqueta = `${fecha.toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' })}: ${bs(d.neto)}`;
            return (
              <Tip key={d.fecha} label={etiqueta}>
                <button type="button" className="group flex h-full flex-1 items-end focus:outline-none" aria-label={etiqueta}>
                  <span
                    className={`block w-full rounded-t-[4px] ${d.fecha === hoy ? 'bg-graphite-900' : 'bg-graphite-400'} group-hover:bg-graphite-700 group-focus-visible:bg-graphite-700`}
                    style={{ height: d.neto > 0 ? `${Math.max(3, (d.neto / max) * 100)}%` : '2px', opacity: d.neto > 0 ? 1 : 0.35 }}
                  />
                </button>
              </Tip>
            );
          })}
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-graphite-400">
          <span>{diaLocal(t.dias[0].fecha).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })}</span>
          <span>Hoy</span>
        </div>
      </div>
    </Seccion>
  );
}

function ElMes({ mes }: { mes: NonNullable<Inicio['mes']> }) {
  const nombreMes = new Date().toLocaleDateString('es-BO', { month: 'long' });
  const filas: [string, string, string?][] = [
    ['Ingresos', bs(mes.ingresos)],
    ['Por cobrar', bs(mes.porCobrar), mes.ordenesConSaldo ? pl(mes.ordenesConSaldo, 'orden en el taller', 'órdenes en el taller') : undefined],
    ['Órdenes ingresadas', entero(mes.ingresadas)],
    ['Equipos entregados', entero(mes.entregadas)],
  ];
  return (
    <Seccion titulo={`En ${nombreMes}`} extra={<a href="/reportes" className="text-xs font-medium text-graphite-500 hover:text-graphite-900">Reportes →</a>}>
      <dl className="divide-y divide-graphite-100">
        {filas.map(([k, v, det]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
            <dt className="text-sm text-graphite-600">
              {k}
              {det && <span className="block text-xs text-graphite-400">{det}</span>}
            </dt>
            <dd className="font-display text-base font-semibold tabular-nums text-graphite-900">{v}</dd>
          </div>
        ))}
      </dl>
    </Seccion>
  );
}

// ---------------------------------------------------------------------------
// Inicio
// ---------------------------------------------------------------------------

function DashboardPanelContent() {
  const { usuario } = useAuth();
  const { data: d, isLoading, error, dataUpdatedAt } = useInicio();
  const puedeCrearOrden = usePermiso('reparaciones:crear');
  const puedeCobrar = usePermiso('pagos:crear');
  const puedeEntregar = usePermiso('entregas:crear');

  const acciones = [
    puedeCrearOrden && { href: '/reparaciones?nueva=1', label: 'Nueva orden', icono: Plus, principal: true },
    puedeCobrar && d?.perfil !== 'tecnico' && { href: '/pagos', label: 'Registrar pago', icono: Wallet },
    puedeEntregar && d?.perfil !== 'tecnico' && { href: '/entregas', label: 'Registrar entrega', icono: PackageCheck },
    { href: '/seguimiento', label: 'Seguimiento', icono: ClipboardList },
  ].filter(Boolean) as { href: string; label: string; icono: LucideIcon; principal?: boolean }[];

  const encabezado = (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold text-graphite-900">
          {saludo()}
          {usuario?.nombre ? `, ${usuario.nombre}` : ''}
        </h1>
        <p className="text-sm text-graphite-500">
          {fechaLarga()}
          {dataUpdatedAt > 0 && (
            <span className="text-graphite-400">
              {' '}
              · actualizado {new Date(dataUpdatedAt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {acciones.map((a) => (
          <a
            key={a.href}
            href={a.href}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold ${
              a.principal
                ? 'bg-graphite-900 text-white hover:bg-graphite-800'
                : 'border border-graphite-200 bg-white text-graphite-700 hover:bg-graphite-50'
            }`}
          >
            <a.icono size={15} aria-hidden />
            {a.label}
          </a>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {encabezado}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-graphite-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-graphite-100" />
      </div>
    );
  }
  if (error || !d) {
    return (
      <div className="space-y-6">
        {encabezado}
        <p className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error instanceof ApiError ? error.message : 'No se pudo cargar el inicio.'} Intenta recargar la página.
        </p>
      </div>
    );
  }

  const esTecnico = d.perfil === 'tecnico';
  const listas = d.embudo?.estados.find((e) => e.estado === 'LISTO_ENTREGA');

  const kpis: ReactNode[] = esTecnico
    ? [
        <Kpi key="mias" label="Mis órdenes" valor={entero(d.mias?.total ?? 0)} detalle="en curso" icono={Wrench} href="/seguimiento" />,
        <Kpi key="diag" label="Por diagnosticar" valor={entero(d.mias?.porDiagnosticar ?? 0)} detalle="recibidas o en diagnóstico" icono={ClipboardList} tono={d.mias?.porDiagnosticar ? 'alerta' : 'neutral'} />,
        <Kpi key="prom" label="Promesas vencidas" valor={entero(d.atencion.promesaVencida?.total ?? 0)} detalle="o que vencen hoy" icono={CalendarClock} tono={d.atencion.promesaVencida?.total ? 'malo' : 'neutral'} />,
        <Kpi key="urg" label="Urgentes sin técnico" valor={entero(d.atencion.urgentesSinTecnico?.total ?? 0)} detalle="puedes tomarlas" icono={Siren} tono={d.atencion.urgentesSinTecnico?.total ? 'malo' : 'neutral'} />,
      ]
    : [
        d.hoy && <Kpi key="ing" label="Ingresaron hoy" valor={entero(d.hoy.ingresadas)} detalle={pl(d.hoy.ingresadas, 'orden nueva', 'órdenes nuevas')} icono={ClipboardList} />,
        d.hoy && <Kpi key="ent" label="Entregados hoy" valor={entero(d.hoy.entregadas)} detalle="equipos retirados" icono={PackageCheck} tono={d.hoy.entregadas ? 'bueno' : 'neutral'} />,
        d.hoy?.caja && (
          <Kpi
            key="caja"
            label="Caja de hoy"
            valor={bs(d.hoy.caja.neto)}
            detalle={
              d.hoy.caja.porMetodo.length
                ? d.hoy.caja.porMetodo.map((m) => `${m.metodo.toLowerCase()} ${bs(m.monto)}`).join(' · ')
                : 'sin movimientos'
            }
            icono={Wallet}
            href="/pagos"
            tono={d.hoy.caja.neto > 0 ? 'bueno' : 'neutral'}
          />
        ),
        listas && (
          <Kpi
            key="listas"
            label="Listos para entrega"
            valor={entero(listas.cantidad)}
            detalle={d.atencion.sinRetirar?.total ? `${d.atencion.sinRetirar.total} sin retirar hace ${d.umbrales.diasSinRetirar}+ días` : 'esperando al cliente'}
            icono={PackageCheck}
            href={`/reparaciones?estadoId=${listas.estadoId}`}
            tono={d.atencion.sinRetirar?.total ? 'alerta' : 'neutral'}
          />
        ),
        d.herramientasPrestadas !== null && d.perfil === 'general' && (
          <Kpi key="herr" label="Herramientas prestadas" valor={entero(d.herramientasPrestadas)} icono={Wrench} href="/herramientas/asignaciones" />
        ),
      ].filter(Boolean);

  return (
    <div className="space-y-6">
      {encabezado}

      {kpis.length > 0 && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{kpis}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {esTecnico && d.mias && <MisOrdenes mias={d.mias} />}
          <RequiereAtencion d={d} />
          {d.tendencia && <Tendencia t={d.tendencia} />}
        </div>
        <div className="space-y-6">
          {d.embudo && <EnElTaller embudo={d.embudo} />}
          {d.mes && <ElMes mes={d.mes} />}
          {d.herramientasPrestadas !== null && d.perfil === 'admin' && (
            <a
              href="/herramientas/asignaciones"
              className="flex items-center justify-between rounded-lg border border-graphite-200 bg-white px-4 py-3 text-sm shadow-sm hover:bg-graphite-50"
            >
              <span className="flex items-center gap-2 text-graphite-700">
                <Wrench size={15} aria-hidden />
                Herramientas prestadas
              </span>
              <span className="font-semibold tabular-nums text-graphite-900">{d.herramientasPrestadas}</span>
            </a>
          )}
          {!d.embudo && !d.mes && d.atencion.stockBajo === null && (
            <p className="flex items-center gap-2 rounded-lg border border-graphite-200 bg-white p-4 text-sm text-graphite-500">
              <AlertTriangle size={15} aria-hidden />
              Tu rol no tiene indicadores en el inicio.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPanel() {
  return (
    <QueryProvider>
      <DashboardPanelContent />
    </QueryProvider>
  );
}
