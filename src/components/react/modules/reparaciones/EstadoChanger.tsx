import { useState } from 'react';
import { useEstadosOrden } from '../../../../lib/hooks/useEstadosOrden';
import { useReparacionMutations } from '../../../../lib/hooks/useReparaciones';
import { ApiError } from '../../../../lib/api/client';
import { estadoOrdenLabel } from '../../../../lib/utils/estado';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import { useConfiguracion } from '../../../../lib/hooks/useConfiguracion';
import GarantiaCampos, { garantiaInicial, garantiaPayload, garantiaValida, type GarantiaValor } from '../../forms/GarantiaCampos';
import type { OrdenReparacion } from '../../../../types/reparacion';

export default function EstadoChanger({ orden }: { orden: OrdenReparacion }) {
  const { data: estados } = useEstadosOrden();
  const { changeEstado } = useReparacionMutations(orden.id);
  const [estadoId, setEstadoId] = useState<number>(orden.estadoId);
  const [comentario, setComentario] = useState('');
  const puedeEditar = usePermiso('reparaciones:editar');
  const { data: config } = useConfiguracion();
  const [garantia, setGarantia] = useState<GarantiaValor | null>(null);

  const errorMessage =
    changeEstado.error instanceof ApiError
      ? changeEstado.error.message
      : changeEstado.error
        ? 'Error inesperado'
        : null;

  // Al terminar la reparación (pasar a Listo para entrega) se define la
  // garantía: así quien entrega solo la informa.
  const elegido = (estados ?? []).find((e) => e.id === estadoId);
  const terminaReparacion = elegido?.nombre === 'LISTO_ENTREGA' && orden.estado.nombre !== 'LISTO_ENTREGA';
  const valorGarantia =
    garantia ?? garantiaInicial(orden.garantiaDias, orden.garantiaCondiciones, config?.garantiaDiasDefault ?? 30);
  const faltaGarantia = terminaReparacion && !garantiaValida(valorGarantia);

  function handleSubmit() {
    if (estadoId === orden.estadoId || faltaGarantia) return;
    changeEstado.mutate(
      { estadoId, comentario: comentario || undefined, ...(terminaReparacion && garantiaPayload(valorGarantia)) },
      {
        onSuccess: () => {
          setComentario('');
          setGarantia(null);
        },
      },
    );
  }

  // Con la entrega registrada la orden queda cerrada: si fue un error se
  // anula la entrega (panel Entrega). Mismas reglas que el backend.
  if (orden.entrega) {
    return (
      <p className="text-sm text-graphite-500">
        La orden ya tiene una entrega registrada, así que su estado no se cambia aquí. Si fue un error, anula la
        entrega desde el panel <strong>Entrega</strong>.
      </p>
    );
  }

  // "Entregado" no se elige a mano: se llega registrando la entrega.
  const opciones = (estados ?? []).filter((e) => e.nombre !== 'ENTREGADO' || e.id === orden.estadoId);

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
          {opciones.map((estado) => (
            <option key={estado.id} value={estado.id}>
              {estadoOrdenLabel(estado.nombre)}
            </option>
          ))}
        </select>
      </div>

      {terminaReparacion && (
        <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3">
          <p className="mb-2 text-sm font-medium text-graphite-900">
            Garantía de la reparación <span className="text-red-500">*</span>
          </p>
          <GarantiaCampos valor={valorGarantia} onChange={setGarantia} condicionesGenerales={config?.garantiaCondiciones} />
        </div>
      )}

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

      <p className="text-xs text-graphite-400">Para entregar el equipo usa el panel Entrega (verifica el pago).</p>

      {errorMessage && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}

      {puedeEditar && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={changeEstado.isPending || estadoId === orden.estadoId || faltaGarantia}
          className="w-full rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-50"
        >
          {changeEstado.isPending ? 'Actualizando…' : 'Actualizar estado'}
        </button>
      )}
    </div>
  );
}
