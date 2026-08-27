import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { useReparacionMutations } from '../../../../lib/hooks/useReparaciones';
import { ApiError } from '../../../../lib/api/client';
import { usePermiso } from '../../../../lib/hooks/useAuth';
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

export default function DiagnosticosPanel({ orden }: { orden: OrdenReparacion }) {
  const { addDiagnostico } = useReparacionMutations(orden.id);
  const [open, setOpen] = useState(false);
  const puedeCrear = usePermiso('diagnosticos:crear');
  const [form, setForm] = useState({
    fallaDetectada: '',
    diagnostico: '',
    solucionPropuesta: '',
    observaciones: '',
  });

  const errorMessage =
    addDiagnostico.error instanceof ApiError
      ? addDiagnostico.error.message
      : addDiagnostico.error
        ? 'Error inesperado'
        : null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    addDiagnostico.mutate(
      { ordenId: orden.id, ...form },
      {
        onSuccess: () => {
          setForm({ fallaDetectada: '', diagnostico: '', solucionPropuesta: '', observaciones: '' });
          setOpen(false);
        },
      },
    );
  }

  const diagnosticos = orden.diagnosticos ?? [];

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {diagnosticos.length === 0 && !open && (
          <li className="text-sm text-graphite-400">Aún no se registró ningún diagnóstico.</li>
        )}
        {diagnosticos.map((d) => (
          <li key={d.id} className="rounded-md border border-graphite-100 p-3 text-sm">
            <p className="mb-1 text-xs text-graphite-400">{formatFechaHora(d.fecha)}</p>
            {d.fallaDetectada && (
              <p>
                <span className="font-medium text-graphite-900">Falla detectada: </span>
                {d.fallaDetectada}
              </p>
            )}
            {d.diagnostico && (
              <p>
                <span className="font-medium text-graphite-900">Diagnóstico: </span>
                {d.diagnostico}
              </p>
            )}
            {d.solucionPropuesta && (
              <p>
                <span className="font-medium text-graphite-900">Solución propuesta: </span>
                {d.solucionPropuesta}
              </p>
            )}
            {d.observaciones && (
              <p>
                <span className="font-medium text-graphite-900">Observaciones: </span>
                {d.observaciones}
              </p>
            )}
          </li>
        ))}
      </ul>

      {!open && puedeCrear && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite-900 hover:underline"
        >
          <Plus size={15} />
          Registrar diagnóstico
        </button>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-md border border-graphite-100 p-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Falla detectada</label>
            <textarea
              rows={2}
              value={form.fallaDetectada}
              onChange={(e) => setForm((p) => ({ ...p, fallaDetectada: e.target.value }))}
              className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Diagnóstico</label>
            <textarea
              rows={2}
              value={form.diagnostico}
              onChange={(e) => setForm((p) => ({ ...p, diagnostico: e.target.value }))}
              className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Solución propuesta</label>
            <textarea
              rows={2}
              value={form.solucionPropuesta}
              onChange={(e) => setForm((p) => ({ ...p, solucionPropuesta: e.target.value }))}
              className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Observaciones</label>
            <textarea
              rows={2}
              value={form.observaciones}
              onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))}
              className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>

          {errorMessage && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-graphite-600 hover:bg-graphite-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={addDiagnostico.isPending}
              className="rounded-md bg-graphite-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-50"
            >
              {addDiagnostico.isPending ? 'Guardando…' : 'Guardar diagnóstico'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
