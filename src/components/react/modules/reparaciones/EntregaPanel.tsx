import { useMutation } from '@tanstack/react-query';
import { FileDown, Loader2, Undo2 } from 'lucide-react';
import { useState } from 'react';
import EntregaForm from '../../forms/EntregaForm';
import MotivoDialog from '../../ui/MotivoDialog';
import { useEntregaByOrden, useEntregaMutations } from '../../../../lib/hooks/useEntregas';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import { entregasApi } from '../../../../lib/api/entregas';
import { ApiError } from '../../../../lib/api/client';
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

const msg = (e: unknown) => (e instanceof ApiError ? e.message : e ? 'Error inesperado' : null);

export default function EntregaPanel({ orden }: { orden: OrdenReparacion }) {
  const { data: entrega, isLoading, exists } = useEntregaByOrden(orden.id);
  const { anular } = useEntregaMutations(orden.id);
  const puedeCrear = usePermiso('entregas:crear');
  const puedeAnular = usePermiso('entregas:eliminar');
  const [anularOpen, setAnularOpen] = useState(false);
  const acta = useMutation({
    mutationFn: () => entregasApi.acta(entrega!.id, orden.codigoOrden),
  });

  if (isLoading) {
    return <div className="h-20 animate-pulse rounded-md bg-graphite-100" />;
  }

  if (exists && entrega) {
    const devolucion = orden.estado.nombre !== 'ENTREGADO';
    return (
      <div className="space-y-3 text-sm">
        <div className="space-y-1">
          <p className="text-graphite-900">
            {devolucion ? 'Devuelto' : 'Entregado'} el{' '}
            <span className="font-medium">{formatFechaHora(entrega.fechaEntrega)}</span>
          </p>
          <p className="text-graphite-600">
            Retiró: {entrega.nombreRecibe ?? '—'}
            {entrega.documentoRecibe && ` (${entrega.documentoRecibe})`}
          </p>
          {entrega.usuarioEntrega && (
            <p className="text-xs text-graphite-400">
              Registró: {entrega.usuarioEntrega.nombre} {entrega.usuarioEntrega.apellido ?? ''}
            </p>
          )}
          {entrega.observaciones && <p className="text-graphite-600">{entrega.observaciones}</p>}
        </div>

        <button
          type="button"
          onClick={() => acta.mutate()}
          disabled={acta.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-graphite-200 px-3 py-2 text-sm font-medium text-graphite-700 hover:bg-graphite-50 disabled:opacity-60"
        >
          {acta.isPending ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
          {devolucion ? 'Acta de devolución (PDF)' : 'Acta de entrega y garantía (PDF)'}
        </button>
        {msg(acta.error) && <p className="text-xs text-red-600">{msg(acta.error)}</p>}

        {puedeAnular && (
          <button
            type="button"
            onClick={() => setAnularOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-graphite-500 hover:text-red-600"
          >
            <Undo2 size={12} />
            Anular entrega
          </button>
        )}

        <MotivoDialog
          open={anularOpen}
          onClose={() => setAnularOpen(false)}
          title="Anular entrega"
          description="Úsalo solo si la entrega se registró por error (el equipo no se retiró). La orden volverá a 'Listo para entrega' y se eliminará su garantía."
          confirmLabel="Anular entrega"
          isLoading={anular.isPending}
          error={msg(anular.error)}
          onConfirm={(motivo) =>
            anular.mutate({ id: entrega.id, motivo }, { onSuccess: () => setAnularOpen(false) })
          }
        />
      </div>
    );
  }

  if (!puedeCrear) {
    return <p className="text-sm text-graphite-400">Esta orden aún no fue entregada.</p>;
  }

  return <EntregaForm orden={orden} />;
}
