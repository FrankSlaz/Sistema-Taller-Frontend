import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import Badge from '../../ui/Badge';
import ConfirmDialog from '../../ui/ConfirmDialog';
import PresupuestoFormModal from '../../forms/PresupuestoFormModal';
import { usePresupuestos, usePresupuestoMutations } from '../../../../lib/hooks/usePresupuestos';
import { estadoPresupuestoClasses, estadoPresupuestoLabel } from '../../../../lib/utils/estado';
import type { OrdenReparacion } from '../../../../types/reparacion';
import type { Presupuesto } from '../../../../types/presupuesto';

function formatMonto(value?: string | number | null) {
  if (value === null || value === undefined) return '—';
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? `Bs ${num.toFixed(2)}` : '—';
}

export default function PresupuestosPanel({ orden }: { orden: OrdenReparacion }) {
  const { data } = usePresupuestos({ ordenId: orden.id, limit: 50 });
  const { changeEstado, remove } = usePresupuestoMutations(orden.id);
  const [formState, setFormState] = useState<{ open: boolean; presupuesto: Presupuesto | null }>({
    open: false,
    presupuesto: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Presupuesto | null>(null);

  const presupuestos = data?.items ?? [];

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {presupuestos.length === 0 && (
          <li className="text-sm text-graphite-400">Sin presupuestos registrados para esta orden.</li>
        )}

        {presupuestos.map((p) => (
          <li key={p.id} className="rounded-md border border-graphite-100 p-3 text-sm">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="font-medium text-graphite-900">{formatMonto(p.totalEstimado)}</span>
              <div className="flex items-center gap-1">
                <Badge label={estadoPresupuestoLabel(p.estado)} className={estadoPresupuestoClasses(p.estado)} />

                {p.estado === 'PENDIENTE' && (
                  <>
                    <button
                      type="button"
                      onClick={() => changeEstado.mutate({ id: p.id, payload: { estado: 'APROBADO' } })}
                      disabled={changeEstado.isPending}
                      className="rounded-md p-1 text-graphite-400 hover:bg-green-50 hover:text-green-700"
                      aria-label="Aprobar presupuesto"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => changeEstado.mutate({ id: p.id, payload: { estado: 'RECHAZADO' } })}
                      disabled={changeEstado.isPending}
                      className="rounded-md p-1 text-graphite-400 hover:bg-red-50 hover:text-red-700"
                      aria-label="Rechazar presupuesto"
                    >
                      <X size={14} />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setFormState({ open: true, presupuesto: p })}
                  className="rounded-md p-1 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
                  aria-label="Editar presupuesto"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(p)}
                  className="rounded-md p-1 text-graphite-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Eliminar presupuesto"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {p.descripcion && <p className="text-graphite-600">{p.descripcion}</p>}
            <p className="mt-1 text-xs text-graphite-400">
              Mano de obra: {formatMonto(p.costoManoObra)} · Repuestos: {formatMonto(p.costoRepuestos)}
              {p.tecnico && (
                <>
                  {' · '}
                  {p.tecnico.nombre} {p.tecnico.apellido ?? ''}
                </>
              )}
            </p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setFormState({ open: true, presupuesto: null })}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite-900 hover:underline"
      >
        <Plus size={15} />
        Nuevo presupuesto
      </button>

      <PresupuestoFormModal
        open={formState.open}
        presupuesto={formState.presupuesto}
        defaultOrdenId={orden.id}
        defaultOrdenLabel={orden.codigoOrden}
        onClose={() => setFormState({ open: false, presupuesto: null })}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar presupuesto"
        description="¿Seguro que deseas eliminar este presupuesto? Esta acción no se puede deshacer."
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
