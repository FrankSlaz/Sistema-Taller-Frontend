import { useEffect, useState } from 'react';
import QueryProvider from '../../providers/QueryProvider';
import ResumenReport from './ResumenReport';
import ReparacionesPorEstadoReport from './ReparacionesPorEstadoReport';
import OrdenesConRetrasoReport from './OrdenesConRetrasoReport';
import TecnicosReport from './TecnicosReport';
import OrdenesPorTipoServicioReport from './OrdenesPorTipoServicioReport';
import IngresosReport from './IngresosReport';
import CuentasPorCobrarReport from './CuentasPorCobrarReport';
import ClientesFrecuentesReport from './ClientesFrecuentesReport';
import StockReport from './StockReport';

const GRUPOS = [
  {
    titulo: 'General',
    reportes: [{ key: 'resumen', label: 'Resumen ejecutivo', Component: ResumenReport, nuevo: true }],
  },
  {
    titulo: 'Operación',
    reportes: [
      { key: 'reparaciones-por-estado', label: 'Reparaciones por estado', Component: ReparacionesPorEstadoReport },
      { key: 'ordenes-retraso', label: 'Órdenes con retraso', Component: OrdenesConRetrasoReport },
      { key: 'tecnicos', label: 'Técnicos', Component: TecnicosReport },
      { key: 'ordenes-por-tipo-servicio', label: 'Por tipo de equipo', Component: OrdenesPorTipoServicioReport },
    ],
  },
  {
    titulo: 'Finanzas',
    reportes: [
      { key: 'ingresos', label: 'Ingresos', Component: IngresosReport },
      { key: 'cuentas-por-cobrar', label: 'Cuentas por cobrar', Component: CuentasPorCobrarReport, nuevo: true },
      { key: 'clientes-frecuentes', label: 'Clientes frecuentes', Component: ClientesFrecuentesReport },
    ],
  },
  {
    titulo: 'Inventario',
    reportes: [{ key: 'stock', label: 'Stock', Component: StockReport }],
  },
];

const TODOS = GRUPOS.flatMap((g) => g.reportes);

/** La pestaña activa vive en el hash (#ingresos) para poder compartir el enlace. */
function claveDesdeHash() {
  if (typeof window === 'undefined') return TODOS[0].key;
  const hash = window.location.hash.slice(1);
  return TODOS.some((r) => r.key === hash) ? hash : TODOS[0].key;
}

function ReportesPanelContent() {
  const [activo, setActivo] = useState(TODOS[0].key);

  useEffect(() => {
    setActivo(claveDesdeHash());
    const onHash = () => setActivo(claveDesdeHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const elegir = (key: string) => {
    setActivo(key);
    history.replaceState(null, '', `#${key}`);
  };

  const Reporte = TODOS.find((r) => r.key === activo) ?? TODOS[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
      {/* Menú de reportes: lateral en escritorio, desplegable en móvil */}
      <nav className="hidden space-y-5 lg:block" aria-label="Reportes">
        {GRUPOS.map((g) => (
          <div key={g.titulo}>
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-graphite-400">{g.titulo}</p>
            <ul className="space-y-0.5">
              {g.reportes.map((r) => (
                <li key={r.key}>
                  <button
                    type="button"
                    onClick={() => elegir(r.key)}
                    aria-current={activo === r.key ? 'page' : undefined}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm font-medium ${
                      activo === r.key
                        ? 'bg-graphite-900 text-white'
                        : 'text-graphite-600 hover:bg-graphite-100 hover:text-graphite-900'
                    }`}
                  >
                    {r.label}
                    {'nuevo' in r && r.nuevo && (
                      <span
                        className={`rounded px-1.5 text-[10px] font-semibold uppercase ${
                          activo === r.key ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Nuevo
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="lg:hidden">
        <label className="mb-1 block text-xs font-medium text-graphite-700" htmlFor="reporte-select">
          Reporte
        </label>
        <select
          id="reporte-select"
          value={activo}
          onChange={(e) => elegir(e.target.value)}
          className="w-full rounded-md border border-graphite-200 bg-white px-3 py-2 text-sm"
        >
          {GRUPOS.map((g) => (
            <optgroup key={g.titulo} label={g.titulo}>
              {g.reportes.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="min-w-0">
        <h2 className="mb-1 font-display text-lg font-semibold text-graphite-900">{Reporte.label}</h2>
        {/* key: al cambiar de reporte, se reinician sus filtros */}
        <Reporte.Component key={Reporte.key} />
      </div>
    </div>
  );
}

export default function ReportesPanel() {
  return (
    <QueryProvider>
      <ReportesPanelContent />
    </QueryProvider>
  );
}
