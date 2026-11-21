import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '../../ui/ConfirmDialog';
import RepuestoFormModal from '../../forms/RepuestoFormModal';
import { useOrdenRepuestoMutations, useOrdenRepuestos } from '../../../../lib/hooks/useOrdenRepuestos';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import type { OrdenReparacion } from '../../../../types/reparacion';
import type { OrdenRepuesto } from '../../../../types/orden-repuesto';

function formatMonto(value: string | number) {
  const num = typeof value === 'string' ? Number(value) : value;
  return `Bs ${Number.isFinite(num) ? num.toFixed(2) : '0.00'}`;
}

export default function RepuestosPanel({ orden }: { orden: OrdenReparacion }) {
  const { data, isLoading } = useOrdenRepuestos({ ordenId: orden.id, limit: 100 });
  const { remove } = useOrdenRepuestoMutations(orden.id);
  const puedeCrear = usePermiso('orden-repuestos:crear');
  const puedeEliminar = usePermiso('orden-repuestos:eliminar');

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OrdenRepuesto | null>(null);

  const repuestos = data?.items ?? [];
  const total = repuestos.reduce((acc, r) => acc + Number(r.subtotal), 0);

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="h-16 animate-pulse rounded-md bg-graphite-100" />
      ) : repuestos.length === 0 ? (
        <p className="text-sm text-graphite-400">Sin repuestos cargados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-graphite-100 text-left text-xs text-graphite-400">
                <th className="py-2 font-medium">Producto</th>
                <th className="py-2 text-right font-medium">Cant.</th>
                <th className="py-2 text-right font-medium">P. unit.</th>
                <th className="py-2 text-right font-medium">Subtotal</th>
                {puedeEliminar && <th className="w-8" />}
              </tr>
            </thead>
            <tbody>
              {repuestos.map((r) => (
                <tr key={r.id} className="border-b border-graphite-50">
                  <td className="py-2 text-graphite-900">
                    {r.producto.nombre}
                    {r.producto.codigo && (
                      <span className="ml-1 text-xs text-graphite-400">({r.producto.codigo})</span>
                    )}
                  </td>
                  <td className="py-2 text-right text-graphite-700">{r.cantidad}</td>
                  <td className="py-2 text-right text-graphite-700">{formatMonto(r.precioUnitario)}</td>
                  <td className="py-2 text-right font-medium text-graphite-900">{formatMonto(r.subtotal)}</td>
                  {puedeEliminar && (
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(r)}
                        className="rounded-md p-1.5 text-graphite-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Quitar repuesto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-2 text-right text-xs text-graphite-400">
                  Total repuestos
                </td>
                <td className="pt-2 text-right font-semibold text-graphite-900">{formatMonto(total)}</td>
                {puedeEliminar && <td />}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {puedeCrear && (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite-900 hover:underline"
        >
          <Plus size={15} />
          Cargar repuesto
        </button>
      )}

      <RepuestoFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        ordenId={orden.id}
        ordenCodigo={orden.codigoOrden}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Quitar repuesto"
        description={
          deleteTarget
            ? `Se devolverán ${deleteTarget.cantidad} unidad(es) de "${deleteTarget.producto.nombre}" al inventario y se descontará del total de la orden.`
            : ''
        }
        confirmLabel="Quitar"
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
