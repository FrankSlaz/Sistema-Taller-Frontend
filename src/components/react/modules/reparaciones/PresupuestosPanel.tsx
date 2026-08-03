import type { OrdenReparacion } from '../../../../types/reparacion';

function formatMonto(value?: string | number | null) {
  if (value === null || value === undefined) return '—';
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? `Bs ${num.toFixed(2)}` : '—';
}

/**
 * Solo lectura por ahora: la gestión completa de presupuestos
 * (aprobar, rechazar, generar) se implementará en el módulo
 * dedicado de Presupuestos.
 */
export default function PresupuestosPanel({ orden }: { orden: OrdenReparacion }) {
  const presupuestos = orden.presupuestos ?? [];

  if (presupuestos.length === 0) {
    return <p className="text-sm text-graphite-400">Sin presupuestos registrados para esta orden.</p>;
  }

  return (
    <ul className="space-y-2">
      {presupuestos.map((p) => (
        <li key={p.id} className="rounded-md border border-graphite-100 p-3 text-sm">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-medium text-graphite-900">{formatMonto(p.totalEstimado)}</span>
            {p.estado && (
              <span className="rounded-full bg-graphite-100 px-2 py-0.5 text-xs text-graphite-600">
                {p.estado}
              </span>
            )}
          </div>
          {p.descripcion && <p className="text-graphite-600">{p.descripcion}</p>}
          <p className="mt-1 text-xs text-graphite-400">
            Mano de obra: {formatMonto(p.costoManoObra)} · Repuestos: {formatMonto(p.costoRepuestos)}
          </p>
        </li>
      ))}
    </ul>
  );
}
