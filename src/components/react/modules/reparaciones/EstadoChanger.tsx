import { useState } from 'react';
import { useEstadosOrden } from '../../../../lib/hooks/useEstadosOrden';
import { useReparacionMutations } from '../../../../lib/hooks/useReparaciones';
import { ApiError } from '../../../../lib/api/client';
import { estadoOrdenLabel } from '../../../../lib/utils/estado';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import type { OrdenReparacion } from '../../../../types/reparacion';

export default function EstadoChanger({ orden }: { orden: OrdenReparacion }) {
  const { data: estados } = useEstadosOrden();
  const { changeEstado } = useReparacionMutations(orden.id);
  const [estadoId, setEstadoId] = useState<number>(orden.estadoId);
  const [comentario, setComentario] = useState('');
  const puedeEditar = usePermiso('reparaciones:editar');

  const errorMessage =
    changeEstado.error instanceof ApiError
      ? changeEstado.error.message
      : changeEstado.error
        ? 'Error inesperado'
        : null;

  function handleSubmit() {
    if (estadoId === orden.estadoId) return;
    changeEstado.mutate({ estadoId, comentario: comentario || undefined }, { onSuccess: () => setComentario('') });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-graphite-900">Nuevo estado</label>
        <select
          value={estadoId}
          onChange={(e) => setEstadoId(Number(e.target.value))}
          disabled={!puedeEditar}
          className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800 disabled:bg-graphite-50 disabled:text-graphite-400"
        >
          {estados?.map((estado) => (
            <option key={estado.id} value={estado.id}>
              {estadoOrdenLabel(estado.nombre)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-graphite-900">Comentario (opcional)</label>
        <textarea
          rows={2}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Ej. Se completó la revisión, listo para pruebas finales…"
          className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
        />
      </div>

      {errorMessage && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}

      {puedeEditar && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={changeEstado.isPending || estadoId === orden.estadoId}
          className="w-full rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-50"
        >
          {changeEstado.isPending ? 'Actualizando…' : 'Actualizar estado'}
        </button>
      )}
    </div>
  );
}
