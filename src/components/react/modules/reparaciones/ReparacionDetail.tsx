import { ArrowLeft, Pencil } from 'lucide-react';
import { useState } from 'react';
import Badge from '../../ui/Badge';
import EditOrdenModal from '../../forms/EditOrdenModal';
import EstadoChanger from './EstadoChanger';
import TecnicosPanel from './TecnicosPanel';
import EntregaPanel from './EntregaPanel';
import GarantiaPanel from './GarantiaPanel';
import DiagnosticosPanel from './DiagnosticosPanel';
import PresupuestosPanel from './PresupuestosPanel';
import HistorialTimeline from './HistorialTimeline';
import QueryProvider from '../../providers/QueryProvider';
import { useReparacion } from '../../../../lib/hooks/useReparaciones';
import { estadoOrdenClasses, estadoOrdenLabel, prioridadClasses } from '../../../../lib/utils/estado';

function formatFecha(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatMonto(value?: string | number | null) {
  if (value === null || value === undefined) return 'Bs 0.00';
  const num = typeof value === 'string' ? Number(value) : value;
  return `Bs ${Number.isFinite(num) ? num.toFixed(2) : '0.00'}`;
}

interface ReparacionDetailProps {
  ordenId: number;
}

function ReparacionDetailContent({ ordenId }: ReparacionDetailProps) {
  const { data: orden, isLoading, error } = useReparacion(ordenId);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-graphite-100" />;
  }

  if (error || !orden) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        No se pudo cargar la orden. Verifica que exista o vuelve al listado.
      </div>
    );
  }

  const total =
    (orden.costoManoObra ? Number(orden.costoManoObra) : 0) +
    (orden.totalRepuestos ? Number(orden.totalRepuestos) : 0);

  return (
    <div className="space-y-6">
      <a
        href="/reparaciones"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite-500 hover:text-graphite-900"
      >
        <ArrowLeft size={15} />
        Volver a órdenes
      </a>

      <div className="rounded-lg border border-graphite-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-graphite-900">{orden.codigoOrden}</h1>
              <Badge label={estadoOrdenLabel(orden.estado.nombre)} className={estadoOrdenClasses(orden.estado.nombre)} />
              <Badge label={orden.prioridad ?? 'NORMAL'} className={prioridadClasses(orden.prioridad)} />
            </div>
            <p className="mt-1 text-sm text-graphite-500">
              {orden.cliente.nombre} · {orden.equipo.tipoEquipo} {orden.equipo.marca} {orden.equipo.modelo}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-graphite-200 px-3 py-1.5 text-sm font-medium text-graphite-700 hover:bg-graphite-50"
          >
            <Pencil size={14} />
            Editar
          </button>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-graphite-100 pt-5 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-graphite-400">Ingreso</dt>
            <dd className="text-sm text-graphite-900">{formatFecha(orden.fechaIngreso)}</dd>
          </div>
          <div>
            <dt className="text-xs text-graphite-400">Promesa</dt>
            <dd className="text-sm text-graphite-900">{formatFecha(orden.fechaPromesa)}</dd>
          </div>
          <div>
            <dt className="text-xs text-graphite-400">Entrega estimada</dt>
            <dd className="text-sm text-graphite-900">{formatFecha(orden.fechaEstimadaEntrega)}</dd>
          </div>
          <div>
            <dt className="text-xs text-graphite-400">Total</dt>
            <dd className="text-sm font-semibold text-graphite-900">{formatMonto(total)}</dd>
          </div>
        </dl>

        <div className="mt-5 border-t border-graphite-100 pt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-graphite-400">Falla reportada</p>
          <p className="mt-1 text-sm text-graphite-900">{orden.fallaReportada || '—'}</p>
        </div>

        {orden.observaciones && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-graphite-400">Observaciones</p>
            <p className="mt-1 text-sm text-graphite-900">{orden.observaciones}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-graphite-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-display text-base font-semibold text-graphite-900">Diagnósticos</h2>
            <DiagnosticosPanel orden={orden} />
          </section>

          <section className="rounded-lg border border-graphite-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-display text-base font-semibold text-graphite-900">Presupuestos</h2>
            <PresupuestosPanel orden={orden} />
          </section>

          <section className="rounded-lg border border-graphite-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-display text-base font-semibold text-graphite-900">Historial</h2>
            <HistorialTimeline orden={orden} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-graphite-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-display text-base font-semibold text-graphite-900">Cambiar estado</h2>
            <EstadoChanger orden={orden} />
          </section>

          <section className="rounded-lg border border-graphite-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-display text-base font-semibold text-graphite-900">Técnicos asignados</h2>
            <TecnicosPanel orden={orden} />
          </section>

          <section className="rounded-lg border border-graphite-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-display text-base font-semibold text-graphite-900">Entrega</h2>
            <EntregaPanel orden={orden} />
          </section>

          <section className="rounded-lg border border-graphite-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-display text-base font-semibold text-graphite-900">Garantía</h2>
            <GarantiaPanel orden={orden} />
          </section>
        </div>
      </div>

      <EditOrdenModal open={editOpen} onClose={() => setEditOpen(false)} orden={orden} />
    </div>
  );
}

export default function ReparacionDetail(props: ReparacionDetailProps) {
  return (
    <QueryProvider>
      <ReparacionDetailContent {...props} />
    </QueryProvider>
  );
}
