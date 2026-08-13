import { useState, type FormEvent } from 'react';
import { useEntregaByOrden, useEntregaMutations } from '../../../../lib/hooks/useEntregas';
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

export default function EntregaPanel({ orden }: { orden: OrdenReparacion }) {
  const { data: entrega, isLoading, exists } = useEntregaByOrden(orden.id);
  const { create } = useEntregaMutations(orden.id);
  const [nombreRecibe, setNombreRecibe] = useState('');
  const [documentoRecibe, setDocumentoRecibe] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const errorMessage =
    create.error instanceof ApiError ? create.error.message : create.error ? 'Error inesperado' : null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    create.mutate({
      ordenId: orden.id,
      nombreRecibe: nombreRecibe || undefined,
      documentoRecibe: documentoRecibe || undefined,
      observaciones: observaciones || undefined,
    });
  }

  if (isLoading) {
    return <div className="h-20 animate-pulse rounded-md bg-graphite-100" />;
  }

  if (exists && entrega) {
    return (
      <div className="space-y-1 text-sm">
        <p className="text-graphite-900">
          Entregado el <span className="font-medium">{formatFechaHora(entrega.fechaEntrega)}</span>
        </p>
        {entrega.nombreRecibe && (
          <p className="text-graphite-600">
            Recibió: {entrega.nombreRecibe}
            {entrega.documentoRecibe && ` (${entrega.documentoRecibe})`}
          </p>
        )}
        {entrega.usuarioEntrega && (
          <p className="text-xs text-graphite-400">
            Registró: {entrega.usuarioEntrega.nombre} {entrega.usuarioEntrega.apellido ?? ''}
          </p>
        )}
        {entrega.observaciones && <p className="text-graphite-600">{entrega.observaciones}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-graphite-500">
        Esta orden aún no fue entregada. Registrar la entrega marcará la orden como{' '}
        <span className="font-medium">ENTREGADO</span> automáticamente.
      </p>

      <div>
        <label className="mb-1 block text-xs font-medium text-graphite-900">Nombre de quien recibe</label>
        <input
          type="text"
          value={nombreRecibe}
          onChange={(e) => setNombreRecibe(e.target.value)}
          className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-graphite-900">Documento</label>
        <input
          type="text"
          value={documentoRecibe}
          onChange={(e) => setDocumentoRecibe(e.target.value)}
          className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-graphite-900">Observaciones</label>
        <textarea
          rows={2}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
        />
      </div>

      {errorMessage && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}

      <button
        type="submit"
        disabled={create.isPending}
        className="w-full rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-50"
      >
        {create.isPending ? 'Registrando…' : 'Registrar entrega'}
      </button>
    </form>
  );
}
