import Modal from '../../ui/Modal';
import Badge from '../../ui/Badge';
import { useHerramienta, useHerramientaMutations } from '../../../../lib/hooks/useHerramientas';
import { ApiError } from '../../../../lib/api/client';
import { estadoHerramientaClasses, estadoHerramientaLabel } from '../../../../lib/utils/estado';
import { ESTADOS_HERRAMIENTA_MANUALES, type EstadoHerramientaManual } from '../../../../types/herramienta';
import { usePermiso } from '../../../../lib/hooks/useAuth';

interface HerramientaDetailModalProps {
  herramientaId: number | null;
  onClose: () => void;
  onAsignar: (id: number) => void;
}

function formatFecha(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatMonto(value?: string | number | null) {
  if (value === null || value === undefined) return '—';
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? `Bs ${num.toFixed(2)}` : '—';
}

export default function HerramientaDetailModal({
  herramientaId,
  onClose,
  onAsignar,
}: HerramientaDetailModalProps) {
  const { data: herramienta, isLoading } = useHerramienta(herramientaId ?? 0);
  const { changeEstado, devolver } = useHerramientaMutations(herramientaId ?? undefined);
  const puedeEditar = usePermiso('herramientas:editar');

  const errorMessage =
    changeEstado.error instanceof ApiError
      ? changeEstado.error.message
      : changeEstado.error
        ? 'Error inesperado'
        : null;

  if (!herramientaId) return null;

  const asignacionActiva = herramienta?.asignaciones?.find((a) => !a.fechaDevolucion);
  const transicionesDisponibles: EstadoHerramientaManual[] = ESTADOS_HERRAMIENTA_MANUALES.filter(
    (e) => e !== herramienta?.estado,
  );

  return (
    <Modal open={!!herramientaId} onClose={onClose} title={herramienta?.nombre ?? 'Herramienta'}>
      {isLoading || !herramienta ? (
        <div className="h-40 animate-pulse rounded-md bg-graphite-100" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge label={estadoHerramientaLabel(herramienta.estado)} className={estadoHerramientaClasses(herramienta.estado)} />
            {herramienta.estado === 'DISPONIBLE' && puedeEditar && (
              <button
                type="button"
                onClick={() => onAsignar(herramienta.id)}
                className="rounded-md bg-graphite-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-graphite-800"
              >
                Asignar
              </button>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-graphite-400">Marca / Modelo</dt>
              <dd className="text-graphite-900">
                {[herramienta.marca, herramienta.modelo].filter(Boolean).join(' ') || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-graphite-400">N.º de serie</dt>
              <dd className="text-graphite-900">{herramienta.numeroSerie ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-graphite-400">Fecha de compra</dt>
              <dd className="text-graphite-900">{formatFecha(herramienta.fechaCompra)}</dd>
            </div>
            <div>
              <dt className="text-xs text-graphite-400">Costo</dt>
              <dd className="text-graphite-900">{formatMonto(herramienta.costo)}</dd>
            </div>
          </dl>

          {herramienta.observaciones && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-graphite-400">Observaciones</p>
              <p className="mt-1 text-sm text-graphite-900">{herramienta.observaciones}</p>
            </div>
          )}

          {herramienta.estado === 'ASIGNADA' && asignacionActiva ? (
            puedeEditar ? (
            <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm">
              <p className="text-blue-900">
                Prestada a{' '}
                <span className="font-medium">
                  {asignacionActiva.usuario.nombre} {asignacionActiva.usuario.apellido ?? ''}
                </span>{' '}
                desde el {formatFecha(asignacionActiva.fechaEntrega)}.
              </p>
              <button
                type="button"
                onClick={() => devolver.mutate(asignacionActiva.id)}
                disabled={devolver.isPending}
                className="mt-2 rounded-md border border-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
              >
                {devolver.isPending ? 'Registrando…' : 'Registrar devolución'}
              </button>
            </div>
            ) : (
              <p className="text-sm text-graphite-500">Prestada a {asignacionActiva.usuario.nombre}.</p>
            )
          ) : puedeEditar ? (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-graphite-400">Cambiar estado</p>
              <div className="flex flex-wrap gap-2">
                {transicionesDisponibles.map((estado) => (
                  <button
                    key={estado}
                    type="button"
                    onClick={() => changeEstado.mutate({ estado })}
                    disabled={changeEstado.isPending}
                    className="rounded-md border border-graphite-200 px-2.5 py-1 text-xs font-medium text-graphite-700 hover:bg-graphite-50"
                  >
                    {estadoHerramientaLabel(estado)}
                  </button>
                ))}
              </div>
              {errorMessage && <p className="mt-2 text-sm text-red-700">{errorMessage}</p>}
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-graphite-400">
              Historial de asignaciones
            </p>
            {!herramienta.asignaciones || herramienta.asignaciones.length === 0 ? (
              <p className="text-sm text-graphite-400">Sin asignaciones registradas.</p>
            ) : (
              <ul className="space-y-1.5">
                {herramienta.asignaciones.map((a) => (
                  <li key={a.id} className="flex items-center justify-between text-sm">
                    <span className="text-graphite-900">
                      {a.usuario.nombre} {a.usuario.apellido ?? ''}
                    </span>
                    <span className="text-xs text-graphite-400">
                      {formatFecha(a.fechaEntrega)} → {a.fechaDevolucion ? formatFecha(a.fechaDevolucion) : 'activo'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
