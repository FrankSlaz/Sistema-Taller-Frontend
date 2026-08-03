import { estadoOrdenLabel } from '../../../../lib/utils/estado';
import type { OrdenReparacion } from '../../../../types/reparacion';

function formatFechaHora(value: string) {
  return new Date(value).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistorialTimeline({ orden }: { orden: OrdenReparacion }) {
  const historial = orden.historialOrden ?? [];

  if (historial.length === 0) {
    return <p className="text-sm text-graphite-400">Sin movimientos registrados aún.</p>;
  }

  return (
    <ol className="space-y-4 border-l border-graphite-200 pl-4">
      {historial.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-graphite-800" />
          <p className="text-xs text-graphite-400">{formatFechaHora(item.fecha)}</p>
          <p className="text-sm text-graphite-900">
            {item.estadoAnterior && item.estadoNuevo
              ? `${estadoOrdenLabel(item.estadoAnterior)} → ${estadoOrdenLabel(item.estadoNuevo)}`
              : item.estadoNuevo
                ? estadoOrdenLabel(item.estadoNuevo)
                : 'Actualización de la orden'}
          </p>
          {item.comentario && <p className="text-sm text-graphite-600">{item.comentario}</p>}
          {item.usuario && (
            <p className="text-xs text-graphite-400">
              por {item.usuario.nombre} {item.usuario.apellido ?? ''}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
