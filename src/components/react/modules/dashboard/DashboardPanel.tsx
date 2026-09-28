import { AlertTriangle, Plus, Wrench } from 'lucide-react';
import MetricCard from './MetricCard';
import QueryProvider from '../../providers/QueryProvider';
import { useAuth } from '../../../../lib/hooks/useAuth';
import {
  useDashboardGarantiasActivas,
  useDashboardHerramientasPrestadas,
  useDashboardIngresosDelMes,
  useDashboardOrdenes,
  useDashboardStockBajo,
} from '../../../../lib/hooks/useDashboard';

function formatMonto(value?: number) {
  if (value === undefined) return undefined;
  return `Bs ${value.toFixed(2)}`;
}

function DashboardPanelContent() {
  const { usuario, isLoading: authLoading, hasPermiso } = useAuth();
  const ordenes = useDashboardOrdenes();
  const stockBajo = useDashboardStockBajo();
  const herramientas = useDashboardHerramientasPrestadas();
  const garantias = useDashboardGarantiasActivas();
  const ingresos = useDashboardIngresosDelMes();

  const puedeCrearOrden = hasPermiso('reparaciones:crear');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-graphite-500">
          {authLoading ? 'Cargando…' : `Hola, ${usuario?.nombre ?? ''}. Este es el resumen de hoy.`}
        </p>

        <div className="flex gap-2">
          {puedeCrearOrden && (
            <a
              href="/reparaciones"
              className="inline-flex items-center gap-1.5 rounded-md bg-graphite-900 px-3 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
            >
              <Plus size={15} />
              Nueva orden
            </a>
          )}
        </div>
      </div>

      {ordenes.puedeVer && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-graphite-400">
            Órdenes de reparación
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Activas" value={ordenes.activas} isLoading={ordenes.isLoading} />
            <MetricCard
              label="Pendientes de diagnóstico"
              value={ordenes.recibidas}
              isLoading={ordenes.isLoading}
              hint="Estado RECIBIDO"
            />
            <MetricCard
              label="Listas para entrega"
              value={ordenes.listasEntrega}
              isLoading={ordenes.isLoading}
              tone="green"
            />
            <MetricCard
              label="Urgentes"
              value={ordenes.urgentes}
              isLoading={ordenes.isLoading}
              tone={ordenes.urgentes && ordenes.urgentes > 0 ? 'red' : 'default'}
            />
          </div>
        </div>
      )}

      {(stockBajo.puedeVer || herramientas.puedeVer || garantias.puedeVer || ingresos.puedeVer) && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-graphite-400">Otros indicadores</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stockBajo.puedeVer && (
              <MetricCard
                label="Productos con stock bajo"
                value={stockBajo.total}
                isLoading={stockBajo.isLoading}
                tone={stockBajo.total && stockBajo.total > 0 ? 'amber' : 'default'}
              />
            )}
            {herramientas.puedeVer && (
              <MetricCard
                label="Herramientas prestadas"
                value={herramientas.total}
                isLoading={herramientas.isLoading}
              />
            )}
            {garantias.puedeVer && (
              <MetricCard
                label="Garantías activas"
                value={garantias.total}
                isLoading={garantias.isLoading}
                hint={garantias.esAproximado ? 'Aproximado (más de 100 registradas)' : undefined}
              />
            )}
            {ingresos.puedeVer && (
              <MetricCard
                label="Ingresos del mes"
                value={formatMonto(ingresos.totalIngresos)}
                isLoading={ingresos.isLoading}
                tone="green"
              />
            )}
          </div>
        </div>
      )}

      {stockBajo.puedeVer && stockBajo.total !== undefined && stockBajo.total > 0 && (
        <a
          href="/inventario"
          className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 hover:bg-amber-100"
        >
          <AlertTriangle size={16} />
          {stockBajo.total} producto{stockBajo.total === 1 ? '' : 's'} con stock por debajo del mínimo — revisar
          inventario
        </a>
      )}

      {herramientas.puedeVer && (
        <a
          href="/herramientas"
          className="flex items-center gap-2 text-sm font-medium text-graphite-500 hover:text-graphite-900"
        >
          <Wrench size={14} />
          Ver herramientas y sus asignaciones
        </a>
      )}
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
