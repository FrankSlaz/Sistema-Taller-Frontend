import { useState, type FormEvent } from 'react';
import Badge from '../../ui/Badge';
import { useEntregaByOrden } from '../../../../lib/hooks/useEntregas';
import { useGarantiaMutations } from '../../../../lib/hooks/useGarantias';
import { ApiError } from '../../../../lib/api/client';
import { estadoGarantiaClasses, estadoGarantiaLabel } from '../../../../lib/utils/estado';
import { ESTADOS_GARANTIA, type EstadoGarantia } from '../../../../types/garantia';
import type { OrdenReparacion } from '../../../../types/reparacion';

function formatFecha(value: string) {
  return new Date(value).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function GarantiaPanel({ orden }: { orden: OrdenReparacion }) {
  const { exists: tieneEntrega } = useEntregaByOrden(orden.id);
  const { create, changeEstado } = useGarantiaMutations(orden.id);
  const [dias, setDias] = useState(30);
  const [descripcion, setDescripcion] = useState('');
  const [condiciones, setCondiciones] = useState('');

  const garantia = orden.garantia;
  const errorMessage =
    create.error instanceof ApiError ? create.error.message : create.error ? 'Error inesperado' : null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    create.mutate({
      ordenId: orden.id,
      dias,
      descripcion: descripcion || undefined,
      condiciones: condiciones || undefined,
    });
  }

  if (garantia) {
    const transiciones: EstadoGarantia[] = ESTADOS_GARANTIA.filter((e) => e !== garantia.estado);

    return (
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-graphite-900">
            {garantia.dias} días — vence el {formatFecha(garantia.fechaFin)}
          </span>
          <Badge label={estadoGarantiaLabel(garantia.estado)} className={estadoGarantiaClasses(garantia.estado)} />
        </div>

        {garantia.descripcion && <p className="text-graphite-600">{garantia.descripcion}</p>}
        {garantia.condiciones && <p className="text-xs text-graphite-400">{garantia.condiciones}</p>}

        <div className="flex flex-wrap gap-2 pt-1">
          {transiciones.map((estado) => (
            <button
              key={estado}
              type="button"
              onClick={() => changeEstado.mutate({ id: garantia.id, payload: { estado } })}
              disabled={changeEstado.isPending}
              className="rounded-md border border-graphite-200 px-2.5 py-1 text-xs font-medium text-graphite-700 hover:bg-graphite-50"
            >
              Marcar {estadoGarantiaLabel(estado).toLowerCase()}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!tieneEntrega) {
    return (
      <p className="text-sm text-graphite-400">
        Requiere que la orden tenga una entrega registrada antes de generar garantía.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-graphite-900">Días de garantía</label>
        <input
          type="number"
          min={1}
          required
          value={dias}
          onChange={(e) => setDias(Number(e.target.value))}
          className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-graphite-900">Descripción</label>
        <textarea
          rows={2}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej. Cubre mano de obra y repuesto instalado…"
          className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-graphite-900">Condiciones</label>
        <textarea
          rows={2}
          value={condiciones}
          onChange={(e) => setCondiciones(e.target.value)}
          placeholder="Ej. No cubre daños por líquidos ni golpes posteriores…"
          className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
        />
      </div>

      {errorMessage && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}

      <button
        type="submit"
        disabled={create.isPending}
        className="w-full rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-50"
      >
        {create.isPending ? 'Registrando…' : 'Registrar garantía'}
      </button>
    </form>
  );
}
