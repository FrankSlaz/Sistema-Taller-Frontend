import { useState } from 'react';
import QueryProvider from '../../providers/QueryProvider';
import ReparacionesPorEstadoReport from './ReparacionesPorEstadoReport';
import IngresosReport from './IngresosReport';
import StockBajoReport from './StockBajoReport';
import TecnicosMasOrdenesReport from './TecnicosMasOrdenesReport';
import OrdenesPorTipoServicioReport from './OrdenesPorTipoServicioReport';
import ClientesFrecuentesReport from './ClientesFrecuentesReport';
import OrdenesConRetrasoReport from './OrdenesConRetrasoReport';

const TABS = [
  { key: 'reparaciones-por-estado', label: 'Reparaciones por estado', Component: ReparacionesPorEstadoReport },
  { key: 'ingresos', label: 'Ingresos', Component: IngresosReport },
  { key: 'stock-bajo', label: 'Stock bajo', Component: StockBajoReport },
  { key: 'tecnicos-mas-ordenes', label: 'Técnicos', Component: TecnicosMasOrdenesReport },
  { key: 'ordenes-por-tipo-servicio', label: 'Por tipo de equipo', Component: OrdenesPorTipoServicioReport },
  { key: 'clientes-frecuentes', label: 'Clientes frecuentes', Component: ClientesFrecuentesReport },
  { key: 'ordenes-retraso', label: 'Órdenes con retraso', Component: OrdenesConRetrasoReport },
] as const;

function ReportesPanelContent() {
  const [active, setActive] = useState<(typeof TABS)[number]['key']>(TABS[0].key);

  const ActiveComponent = TABS.find((t) => t.key === active)?.Component ?? TABS[0].Component;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1 border-b border-graphite-200 pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`rounded-t-md px-3 py-2 text-sm font-medium ${
              active === tab.key
                ? 'border-b-2 border-graphite-900 text-graphite-900'
                : 'text-graphite-500 hover:text-graphite-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ActiveComponent />
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
