import { UserMinus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useReparacionMutations, useTecnicos } from '../../../../lib/hooks/useReparaciones';
import { ApiError } from '../../../../lib/api/client';
import { TIPOS_PARTICIPACION, type OrdenReparacion } from '../../../../types/reparacion';
import { usePermiso } from '../../../../lib/hooks/useAuth';

export default function TecnicosPanel({ orden }: { orden: OrdenReparacion }) {
  const { data: tecnicos, error: tecnicosError } = useTecnicos();
  const { assignTecnico, removeTecnico } = useReparacionMutations(orden.id);
  const puedeEditar = usePermiso('reparaciones:editar');
  const [usuarioId, setUsuarioId] = useState<number | ''>('');
  const [tipoParticipacion, setTipoParticipacion] = useState<(typeof TIPOS_PARTICIPACION)[number]>(
    'PRINCIPAL',
  );

  const asignados = new Set(orden.ordenTecnicos.map((t) => t.usuarioId));
  const disponibles = (tecnicos ?? []).filter((t) => !asignados.has(t.id));

  const errorMessage =
    assignTecnico.error instanceof ApiError
      ? assignTecnico.error.message
      : tecnicosError instanceof ApiError
        ? tecnicosError.message
        : null;

  function handleAssign() {
    if (!usuarioId) return;
    assignTecnico.mutate(
      { usuarioId: Number(usuarioId), tipoParticipacion },
      { onSuccess: () => setUsuarioId('') },
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {orden.ordenTecnicos.length === 0 && (
          <li className="text-sm text-graphite-400">Sin técnicos asignados.</li>
        )}
        {orden.ordenTecnicos.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between rounded-md border border-graphite-100 px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium text-graphite-900">
                {t.usuario.nombre} {t.usuario.apellido ?? ''}
              </p>
              <p className="text-xs text-graphite-400">{t.tipoParticipacion ?? 'PRINCIPAL'}</p>
            </div>
            {puedeEditar && (
              <button
                type="button"
                onClick={() => removeTecnico.mutate(t.usuarioId)}
                disabled={removeTecnico.isPending}
                className="rounded-md p-1.5 text-graphite-400 hover:bg-red-50 hover:text-red-600"
                aria-label={`Quitar a ${t.usuario.nombre}`}
              >
                <UserMinus size={15} />
              </button>
            )}
          </li>
        ))}
      </ul>

      {tecnicos && puedeEditar && (
        <div className="flex flex-col gap-2 border-t border-graphite-100 pt-3">
          <select
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value ? Number(e.target.value) : '')}
            className="w-full min-w-0 rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          >
            <option value="">Selecciona un técnico…</option>
            {disponibles.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} {t.apellido ?? ''}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <select
              value={tipoParticipacion}
              onChange={(e) => setTipoParticipacion(e.target.value as (typeof TIPOS_PARTICIPACION)[number])}
              className="min-w-0 flex-1 rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            >
              {TIPOS_PARTICIPACION.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAssign}
              disabled={!usuarioId || assignTecnico.isPending}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-3 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-50"
            >
              <UserPlus size={15} />
              Asignar
            </button>
          </div>
        </div>
      )}

      {errorMessage && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}
    </div>
  );
}
