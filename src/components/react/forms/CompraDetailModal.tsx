import Modal from '../ui/Modal';
import type { Compra } from '../../../types/compra';

interface CompraDetailModalProps {
  compra: Compra | null;
  onClose: () => void;
}

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

export default function CompraDetailModal({ compra, onClose }: CompraDetailModalProps) {
  if (!compra) return null;

  return (
    <Modal open={!!compra} onClose={onClose} title={compra.numeroCompra || `Compra #${compra.id}`}>
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-graphite-400">Proveedor</dt>
            <dd className="text-graphite-900">{compra.proveedor?.nombre ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-graphite-400">Fecha</dt>
            <dd className="text-graphite-900">{formatFechaHora(compra.fecha)}</dd>
          </div>
          <div>
            <dt className="text-xs text-graphite-400">Registrada por</dt>
            <dd className="text-graphite-900">
              {compra.usuario ? `${compra.usuario.nombre} ${compra.usuario.apellido ?? ''}` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-graphite-400">Total</dt>
            <dd className="font-semibold text-graphite-900">{formatMonto(compra.total)}</dd>
          </div>
        </dl>

        {compra.observaciones && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-graphite-400">Observaciones</p>
            <p className="mt-1 text-sm text-graphite-900">{compra.observaciones}</p>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-graphite-400">Productos</p>
          <div className="overflow-hidden rounded-md border border-graphite-100">
            <table className="min-w-full divide-y divide-graphite-100 text-sm">
              <thead className="bg-graphite-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-graphite-400">Producto</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-graphite-400">Cant.</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-graphite-400">P. unit.</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-graphite-400">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-100">
                {compra.detalles.map((d) => (
                  <tr key={d.id}>
                    <td className="px-3 py-2 text-graphite-900">{d.producto.nombre}</td>
                    <td className="px-3 py-2 text-right text-graphite-700">{d.cantidad}</td>
                    <td className="px-3 py-2 text-right text-graphite-700">{formatMonto(d.precioUnitario)}</td>
                    <td className="px-3 py-2 text-right text-graphite-900">{formatMonto(d.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-graphite-400">
          Las compras son un registro contable inmutable: no se pueden editar ni eliminar. Para corregir un
          error, registra un movimiento de ajuste en Inventario.
        </p>
      </div>
    </Modal>
  );
}
