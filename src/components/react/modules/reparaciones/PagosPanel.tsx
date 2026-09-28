import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '../../ui/ConfirmDialog';
import PagoFormModal from '../../forms/PagoFormModal';
import { usePagoMutations, usePagos } from '../../../../lib/hooks/usePagos';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import type { OrdenReparacion } from '../../../../types/reparacion';
import type { Pago } from '../../../../types/pago';

function formatMonto(value: string | number) {
  const num = typeof value === 'string' ? Number(value) : value;
  return `Bs ${Number.isFinite(num) ? num.toFixed(2) : '0.00'}`;
}

function formatFechaHora(value: string) {
  return new Date(value).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PagosPanel({ orden }: { orden: OrdenReparacion }) {
  const { data } = usePagos({ ordenId: orden.id, limit: 50 });
  const { remove } = usePagoMutations(orden.id);
  const puedeCrear = usePermiso('pagos:crear');
  const puedeEliminar = usePermiso('pagos:eliminar');

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pago | null>(null);

  const pagos = data?.items ?? [];
  const resumen = data?.resumen;

  return (
    <div className="space-y-3">
      {resumen && (
        <div className="grid grid-cols-3 gap-2 rounded-md bg-graphite-50 p-3 text-center">
          <div>
            <p className="text-xs text-graphite-400">Total orden</p>
            <p className="font-display text-sm font-semibold text-graphite-900">
              {formatMonto(resumen.totalOrden)}
            </p>
          </div>
          <div>
            <p className="text-xs text-graphite-400">Pagado</p>
            <p className="font-display text-sm font-semibold text-green-700">
              {formatMonto(resumen.totalPagado)}
            </p>
          </div>
          <div>
            <p className="text-xs text-graphite-400">Saldo pendiente</p>
            <p
              className={`font-display text-sm font-semibold ${
                resumen.saldoPendiente > 0 ? 'text-amber-700' : 'text-graphite-900'
              }`}
            >
              {formatMonto(resumen.saldoPendiente)}
            </p>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {pagos.length === 0 && <li className="text-sm text-graphite-400">Sin pagos registrados.</li>}
        {pagos.map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded-md border border-graphite-100 p-3 text-sm">
            <div>
              <p className="font-medium text-graphite-900">
                {formatMonto(p.monto)}{' '}
                <span className="text-xs font-normal text-graphite-400">{p.metodoPago}</span>
              </p>
              <p className="text-xs text-graphite-400">
                {formatFechaHora(p.fecha)}
                {p.referencia && ` · Ref: ${p.referencia}`}
              </p>
              {p.observacion && <p className="text-graphite-600">{p.observacion}</p>}
            </div>
            {puedeEliminar && (
              <button
                type="button"
                onClick={() => setDeleteTarget(p)}
                className="rounded-md p-1.5 text-graphite-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Eliminar pago"
              >
                <Trash2 size={14} />
              </button>
            )}
          </li>
        ))}
      </ul>

      {puedeCrear && (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite-900 hover:underline"
        >
          <Plus size={15} />
          Registrar pago
        </button>
      )}

      <PagoFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaultOrdenId={orden.id}
        defaultOrdenLabel={orden.codigoOrden}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar pago"
        description="¿Seguro que deseas eliminar este pago? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        isLoading={remove.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
      />
    </div>
  );
}
