import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '../../ui/ConfirmDialog';
import DiagnosticoFormModal from '../../forms/DiagnosticoFormModal';
import { useDiagnosticoMutations, useDiagnosticos } from '../../../../lib/hooks/useDiagnosticos';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import type { OrdenReparacion } from '../../../../types/reparacion';
import type { Diagnostico } from '../../../../types/diagnostico';

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
  // Fuente propia (no orden.diagnosticos embebido): trae tecnico con nombre.
  const { data } = useDiagnosticos({ ordenId: orden.id, limit: 50 });
  const { remove } = useDiagnosticoMutations(orden.id);
  const puedeCrear = usePermiso('diagnosticos:crear');
  const puedeEditar = usePermiso('diagnosticos:editar');
  const puedeEliminar = usePermiso('diagnosticos:eliminar');

  const [formState, setFormState] = useState<{ open: boolean; diagnostico: Diagnostico | null }>({
    open: false,
    diagnostico: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Diagnostico | null>(null);

  const diagnosticos = data?.items ?? [];

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {diagnosticos.length === 0 && (
          <li className="text-sm text-graphite-400">Aún no se registró ningún diagnóstico.</li>
        )}
        {diagnosticos.map((d) => (
          <li key={d.id} className="rounded-md border border-graphite-100 p-3 text-sm">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-xs text-graphite-400">
                {formatFechaHora(d.fecha)}
                {d.tecnico && (
                  <>
                    {' · '}
                    {d.tecnico.nombre} {d.tecnico.apellido ?? ''}
                  </>
                )}
              </p>
              <div className="flex items-center gap-1">
                {puedeEditar && (
                  <button
                    type="button"
                    onClick={() => setFormState({ open: true, diagnostico: d })}
                    className="rounded-md p-1 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
                    aria-label="Editar diagnóstico"
                  >
                    <Pencil size={13} />
                  </button>
                )}
                {puedeEliminar && (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(d)}
                    className="rounded-md p-1 text-graphite-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Eliminar diagnóstico"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
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

      {puedeCrear && (
        <button
          type="button"
          onClick={() => setFormState({ open: true, diagnostico: null })}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite-900 hover:underline"
        >
          <Plus size={15} />
          Registrar diagnóstico
        </button>
      )}

      <DiagnosticoFormModal
        open={formState.open}
        diagnostico={formState.diagnostico}
        defaultOrdenId={orden.id}
        defaultOrdenLabel={orden.codigoOrden}
        onClose={() => setFormState({ open: false, diagnostico: null })}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar diagnóstico"
        description="¿Seguro que deseas eliminar este diagnóstico? Esta acción no se puede deshacer."
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
