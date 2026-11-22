import { Download, Loader2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { ApiError } from '../../../../lib/api/client';
import type { EstadoOrden, RangoFechas } from '../../../../types/reporte';

// ---------------------------------------------------------------------------
// Formato (igual que el PDF)
// ---------------------------------------------------------------------------
export const bs = (n: number) =>
  `Bs ${n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const entero = (n: number) => n.toLocaleString('es-BO');
export const porc = (n: number | null) => (n === null ? '—' : `${n.toLocaleString('es-BO')}%`);
export const dias = (n: number | null) => (n === null ? '—' : `${n.toLocaleString('es-BO')} ${n === 1 ? 'día' : 'días'}`);
export const pl = (n: number, uno: string, varios: string) => `${entero(n)} ${n === 1 ? uno : varios}`;
export const fecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
export const variacionTexto = (n: number | null) =>
  n === null ? 'Sin base de comparación' : `${n > 0 ? '+' : ''}${n}% vs período anterior`;
export const tonoVariacion = (n: number | null): Tono => (n === null || n === 0 ? 'neutral' : n > 0 ? 'bueno' : 'malo');

export const ESTADOS: { valor: EstadoOrden; etiqueta: string }[] = [
  { valor: 'RECIBIDO', etiqueta: 'Recibido' },
  { valor: 'DIAGNOSTICO', etiqueta: 'En diagnóstico' },
  { valor: 'ESPERANDO_APROBACION', etiqueta: 'Esperando aprobación' },
  { valor: 'EN_REPARACION', etiqueta: 'En reparación' },
  { valor: 'PRUEBAS', etiqueta: 'En pruebas' },
  { valor: 'LISTO_ENTREGA', etiqueta: 'Listo para entrega' },
  { valor: 'ENTREGADO', etiqueta: 'Entregado' },
  { valor: 'CANCELADO', etiqueta: 'Cancelado' },
  { valor: 'NO_REPARABLE', etiqueta: 'No reparable' },
];
export const ESTADOS_ACTIVOS: EstadoOrden[] = [
  'RECIBIDO',
  'DIAGNOSTICO',
  'ESPERANDO_APROBACION',
  'EN_REPARACION',
  'PRUEBAS',
  'LISTO_ENTREGA',
];
export const PRIORIDADES = [
  { valor: 'URGENTE', etiqueta: 'Urgente' },
  { valor: 'ALTA', etiqueta: 'Alta' },
  { valor: 'NORMAL', etiqueta: 'Normal' },
  { valor: 'BAJA', etiqueta: 'Baja' },
];

// ---------------------------------------------------------------------------
// Tonos (estado del indicador: bueno / malo / alerta / neutral)
// ---------------------------------------------------------------------------
export type Tono = 'bueno' | 'malo' | 'alerta' | 'neutral';

const TONO_CARD: Record<Tono, string> = {
  bueno: 'border-green-200 bg-green-50',
  malo: 'border-red-200 bg-red-50',
  alerta: 'border-amber-200 bg-amber-50',
  neutral: 'border-graphite-200 bg-white',
};
const TONO_VALOR: Record<Tono, string> = {
  bueno: 'text-green-700',
  malo: 'text-red-700',
  alerta: 'text-amber-800',
  neutral: 'text-graphite-900',
};
export const TONO_FILA: Record<Tono, string> = {
  bueno: 'bg-green-50/60',
  malo: 'bg-red-50/70',
  alerta: 'bg-amber-50/70',
  neutral: '',
};

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------
export interface Kpi {
  label: string;
  valor: string;
  detalle?: string;
  tono?: Tono;
}

export function KpiGrid({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {kpis.map((k) => (
        <div key={k.label} className={`min-h-[92px] rounded-lg border p-3 ${TONO_CARD[k.tono ?? 'neutral']}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-graphite-400">{k.label}</p>
          <p className={`mt-1 font-display text-xl font-semibold tabular-nums ${TONO_VALOR[k.tono ?? 'neutral']}`}>
            {k.valor}
          </p>
          {k.detalle && <p className="mt-0.5 text-xs text-graphite-500">{k.detalle}</p>}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Barras horizontales (una sola serie: la longitud codifica la magnitud; el
// número exacto va en texto y en la tabla de al lado)
// ---------------------------------------------------------------------------
export function BarList({
  items,
  vacio = 'Sin datos en el período.',
}: {
  items: { etiqueta: string; valor: number; texto: string }[];
  vacio?: string;
}) {
  const max = Math.max(0, ...items.map((i) => i.valor));
  if (!items.length || max === 0) return <p className="text-sm text-graphite-400">{vacio}</p>;
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li
          key={i.etiqueta}
          className="group grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 rounded-md px-1 py-0.5 hover:bg-graphite-50"
          title={`${i.etiqueta}: ${i.texto}`}
        >
          <span className="truncate text-sm text-graphite-700">{i.etiqueta}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-graphite-100">
            <span
              className="block h-full rounded-full bg-graphite-700 transition-colors group-hover:bg-graphite-900"
              style={{ width: `${Math.max(1.5, (i.valor / max) * 100)}%` }}
            />
          </span>
          <span className="whitespace-nowrap text-sm font-medium tabular-nums text-graphite-900">{i.texto}</span>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Tabla
// ---------------------------------------------------------------------------
export interface Columna<T> {
  titulo: string;
  render: (fila: T) => ReactNode;
  alinear?: 'left' | 'right';
  className?: string;
}

export function Tabla<T>({
  columnas,
  filas,
  tono,
  totales,
  vacio = 'No hay registros para los filtros seleccionados.',
  clave,
}: {
  columnas: Columna<T>[];
  filas: T[];
  tono?: (fila: T) => Tono | undefined;
  totales?: ReactNode[];
  vacio?: string;
  clave: (fila: T, i: number) => string | number;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-graphite-200">
      <table className="min-w-full divide-y divide-graphite-200 text-sm">
        <thead className="bg-graphite-50">
          <tr>
            {columnas.map((c) => (
              <th
                key={c.titulo}
                className={`whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-graphite-500 ${
                  c.alinear === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {c.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-graphite-100 bg-white">
          {filas.length === 0 && (
            <tr>
              <td colSpan={columnas.length} className="px-4 py-8 text-center text-graphite-400">
                {vacio}
              </td>
            </tr>
          )}
          {filas.map((f, i) => (
            <tr key={clave(f, i)} className={`${TONO_FILA[tono?.(f) ?? 'neutral']} hover:bg-graphite-50`}>
              {columnas.map((c) => (
                <td
                  key={c.titulo}
                  className={`px-3 py-2 text-graphite-700 ${c.alinear === 'right' ? 'text-right tabular-nums' : ''} ${c.className ?? ''}`}
                >
                  {c.render(f)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {totales && filas.length > 0 && (
          <tfoot className="bg-graphite-50 font-semibold text-graphite-900">
            <tr>
              {totales.map((t, i) => (
                <td
                  key={i}
                  className={`whitespace-nowrap px-3 py-2 ${columnas[i]?.alinear === 'right' ? 'text-right tabular-nums' : ''}`}
                >
                  {t}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

export function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <div>
        <h3 className="font-display text-base font-semibold text-graphite-900">{titulo}</h3>
        {descripcion && <p className="text-xs text-graphite-500">{descripcion}</p>}
      </div>
      {children}
    </section>
  );
}

/** Enlace al detalle de la orden (para actuar directo desde el reporte). */
export function LinkOrden({ id, codigo }: { id: number; codigo: string }) {
  return (
    <a href={`/reparaciones/${id}`} className="font-medium text-graphite-900 underline-offset-2 hover:underline">
      {codigo}
    </a>
  );
}

// ---------------------------------------------------------------------------
// Contenedor de un reporte: filtros + botón PDF + contenido
// ---------------------------------------------------------------------------
export function ReporteShell({
  descripcion,
  filtros,
  onPdf,
  pdfPending,
  pdfError,
  isLoading,
  isFetching,
  error,
  children,
}: {
  descripcion: string;
  filtros?: ReactNode;
  onPdf: () => void;
  pdfPending: boolean;
  pdfError?: unknown;
  isLoading: boolean;
  isFetching?: boolean;
  error?: unknown;
  children: ReactNode;
}) {
  const msg = (e: unknown) => (e instanceof ApiError ? e.message : e ? 'Error inesperado' : null);
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <p className="max-w-2xl text-sm text-graphite-500">{descripcion}</p>
        <button
          type="button"
          onClick={onPdf}
          disabled={pdfPending || isLoading}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
        >
          {pdfPending ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {pdfPending ? 'Generando PDF…' : 'Descargar PDF'}
        </button>
      </div>

      {filtros && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-graphite-200 bg-graphite-50/60 p-3">
          {filtros}
          {isFetching && !isLoading && <Loader2 size={16} className="mb-2.5 animate-spin text-graphite-400" />}
        </div>
      )}

      {(msg(pdfError) || msg(error)) && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{msg(error) ?? msg(pdfError)}</p>
      )}

      {isLoading ? <div className="h-64 animate-pulse rounded-lg bg-graphite-100" /> : children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filtros
// ---------------------------------------------------------------------------
const inputCls =
  'rounded-md border border-graphite-200 bg-white px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800';

export function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-graphite-700">{label}</span>
      {children}
    </label>
  );
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function presetRango(preset: string): RangoFechas {
  const h = new Date();
  switch (preset) {
    case 'hoy':
      return { fechaInicio: iso(h), fechaFin: iso(h) };
    case '7d':
      return { fechaInicio: iso(new Date(h.getFullYear(), h.getMonth(), h.getDate() - 6)), fechaFin: iso(h) };
    case '30d':
      return { fechaInicio: iso(new Date(h.getFullYear(), h.getMonth(), h.getDate() - 29)), fechaFin: iso(h) };
    case 'mes':
      return { fechaInicio: iso(new Date(h.getFullYear(), h.getMonth(), 1)), fechaFin: iso(h) };
    case 'mesAnterior':
      return {
        fechaInicio: iso(new Date(h.getFullYear(), h.getMonth() - 1, 1)),
        fechaFin: iso(new Date(h.getFullYear(), h.getMonth(), 0)),
      };
    case 'anio':
      return { fechaInicio: iso(new Date(h.getFullYear(), 0, 1)), fechaFin: iso(h) };
    default:
      return {};
  }
}

const PRESETS = [
  { valor: 'hoy', etiqueta: 'Hoy' },
  { valor: '7d', etiqueta: 'Últimos 7 días' },
  { valor: '30d', etiqueta: 'Últimos 30 días' },
  { valor: 'mes', etiqueta: 'Este mes' },
  { valor: 'mesAnterior', etiqueta: 'Mes anterior' },
  { valor: 'anio', etiqueta: 'Este año' },
];

/** Rango de fechas con atajos. `permitirTodo` agrega "Todo el historial". */
export function FiltroFechas({
  valor,
  onChange,
  permitirTodo = false,
  label = 'Período',
}: {
  valor: RangoFechas;
  onChange: (r: RangoFechas) => void;
  permitirTodo?: boolean;
  label?: string;
}) {
  const [preset, setPreset] = useState(() => {
    const encontrado = PRESETS.find((p) => {
      const r = presetRango(p.valor);
      return r.fechaInicio === valor.fechaInicio && r.fechaFin === valor.fechaFin;
    });
    return encontrado?.valor ?? (!valor.fechaInicio && !valor.fechaFin ? 'todo' : 'personalizado');
  });

  return (
    <>
      <Campo label={label}>
        <select
          className={inputCls}
          value={preset}
          onChange={(e) => {
            setPreset(e.target.value);
            if (e.target.value !== 'personalizado') onChange(presetRango(e.target.value));
          }}
        >
          {PRESETS.map((p) => (
            <option key={p.valor} value={p.valor}>
              {p.etiqueta}
            </option>
          ))}
          {permitirTodo && <option value="todo">Todo el historial</option>}
          <option value="personalizado">Personalizado…</option>
        </select>
      </Campo>
      {preset === 'personalizado' && (
        <>
          <Campo label="Desde">
            <input
              type="date"
              className={inputCls}
              value={valor.fechaInicio ?? ''}
              max={valor.fechaFin}
              onChange={(e) => onChange({ ...valor, fechaInicio: e.target.value || undefined })}
            />
          </Campo>
          <Campo label="Hasta">
            <input
              type="date"
              className={inputCls}
              value={valor.fechaFin ?? ''}
              min={valor.fechaInicio}
              onChange={(e) => onChange({ ...valor, fechaFin: e.target.value || undefined })}
            />
          </Campo>
        </>
      )}
    </>
  );
}

export function FiltroSelect({
  label,
  valor,
  onChange,
  opciones,
  todos = 'Todos',
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  opciones: { valor: string; etiqueta: string }[];
  todos?: string | null;
}) {
  return (
    <Campo label={label}>
      <select className={inputCls} value={valor} onChange={(e) => onChange(e.target.value)}>
        {todos !== null && <option value="">{todos}</option>}
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
    </Campo>
  );
}

export function FiltroTexto({
  label,
  valor,
  onChange,
  placeholder,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Campo label={label}>
      <input
        type="search"
        className={`${inputCls} w-56`}
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Campo>
  );
}

/**
 * Selección múltiple de estados como "chips", con atajos. Vacío = todos.
 * Así se puede imprimir solo "En diagnóstico", o solo lo pendiente.
 */
export function FiltroEstados({
  valor,
  onChange,
  excluir = [],
}: {
  valor: EstadoOrden[];
  onChange: (v: EstadoOrden[]) => void;
  excluir?: EstadoOrden[];
}) {
  const opciones = ESTADOS.filter((e) => !excluir.includes(e.valor));
  const toggle = (e: EstadoOrden) => onChange(valor.includes(e) ? valor.filter((x) => x !== e) : [...valor, e]);
  const atajo = (lista: EstadoOrden[]) =>
    lista.length === valor.length && lista.every((e) => valor.includes(e));

  const chip = (activo: boolean) =>
    `rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
      activo
        ? 'border-graphite-900 bg-graphite-900 text-white'
        : 'border-graphite-200 bg-white text-graphite-600 hover:border-graphite-400'
    }`;

  return (
    <div className="w-full">
      <span className="mb-1 block text-xs font-medium text-graphite-700">Estados</span>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={chip(valor.length === 0)} onClick={() => onChange([])}>
          Todos
        </button>
        {!excluir.length && (
          <button type="button" className={chip(atajo(ESTADOS_ACTIVOS))} onClick={() => onChange(ESTADOS_ACTIVOS)}>
            Pendientes (en taller)
          </button>
        )}
        <span className="mx-1 w-px self-stretch bg-graphite-200" />
        {opciones.map((e) => (
          <button
            key={e.valor}
            type="button"
            className={chip(valor.includes(e.valor))}
            aria-pressed={valor.includes(e.valor)}
            onClick={() => toggle(e.valor)}
          >
            {e.etiqueta}
          </button>
        ))}
      </div>
    </div>
  );
}
