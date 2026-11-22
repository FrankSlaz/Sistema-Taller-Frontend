import { ShieldCheck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import Badge from '../../ui/Badge';
import Modal from '../../ui/Modal';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { useGarantiaMutations } from '../../../../lib/hooks/useGarantias';
import { useConfiguracion } from '../../../../lib/hooks/useConfiguracion';
import { ApiError } from '../../../../lib/api/client';
import { estadoGarantiaClasses, estadoGarantiaLabel, estadoOrdenClasses, estadoOrdenLabel } from '../../../../lib/utils/estado';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import { useReparacionMutations } from '../../../../lib/hooks/useReparaciones';
import GarantiaCampos, { garantiaInicial, garantiaPayload, garantiaValida, type GarantiaValor } from '../../forms/GarantiaCampos';
import type { OrdenReparacion } from '../../../../types/reparacion';

const MS_DIA = 24 * 60 * 60 * 1000;
const msg = (e: unknown) => (e instanceof ApiError ? e.message : e ? 'Error inesperado' : null);
const inputCls =
  'w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800';

function formatFecha(value: string | null) {
  return value ? new Date(value).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}

/** Estado real: una ACTIVA cuya fecha de fin ya pasó está VENCIDA. */
function estadoReal(estado: string, fechaFin: string) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (estado === 'ACTIVA' && new Date(fechaFin) < hoy) return 'VENCIDA';
  return estado;
}

export default function GarantiaPanel({ orden }: { orden: OrdenReparacion }) {
  const { create, changeEstado, reclamar } = useGarantiaMutations(orden.id);
  const { data: config } = useConfiguracion();
  const puedeEditar = usePermiso('garantias:editar');
  const puedeReclamar = usePermiso('reparaciones:crear');
  const [reclamoOpen, setReclamoOpen] = useState(false);
  const [anularOpen, setAnularOpen] = useState(false);
  const [dias, setDias] = useState<number | null>(null);

  useEffect(() => {
    if (config && dias === null) setDias(config.garantiaDiasDefault || 30);
  }, [config, dias]);

  const garantia = orden.garantia;
  const reclamos = orden.ordenesGarantia ?? [];

  if (garantia) {
    const estado = estadoReal(String(garantia.estado), garantia.fechaFin);
    const vigente = estado === 'ACTIVA';
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const restantes = vigente ? Math.max(0, Math.ceil((new Date(garantia.fechaFin).getTime() - hoy.getTime()) / MS_DIA)) : null;

    return (
      <div className="space-y-3 text-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-graphite-900">
              {garantia.dias} días · hasta el {formatFecha(garantia.fechaFin)}
            </p>
            {restantes !== null && (
              <p className={`text-xs ${restantes <= 7 ? 'font-medium text-amber-700' : 'text-graphite-500'}`}>
                {restantes === 0 ? 'Vence hoy' : `Quedan ${restantes} ${restantes === 1 ? 'día' : 'días'}`}
              </p>
            )}
          </div>
          <Badge label={estadoGarantiaLabel(estado)} className={estadoGarantiaClasses(estado)} />
        </div>

        {garantia.descripcion && <p className="text-graphite-600">{garantia.descripcion}</p>}
        {garantia.condiciones && <p className="text-xs text-graphite-400">{garantia.condiciones}</p>}

        {reclamos.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-graphite-400">Reclamos</p>
            <ul className="space-y-1">
              {reclamos.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <a href={`/reparaciones/${r.id}`} className="font-medium text-graphite-900 hover:underline">
                    {r.codigoOrden}
                  </a>
                  <Badge label={estadoOrdenLabel(r.estado.nombre)} className={estadoOrdenClasses(r.estado.nombre)} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {vigente && puedeReclamar && (
          <button
            type="button"
            onClick={() => setReclamoOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-graphite-900 px-3 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
          >
            <ShieldCheck size={15} />
            Atender por garantía
          </button>
        )}
        {vigente && puedeEditar && (
          <button
            type="button"
            onClick={() => setAnularOpen(true)}
            className="w-full text-xs font-medium text-graphite-500 hover:text-red-600"
          >
            Anular garantía
          </button>
        )}
        {estado === 'ANULADA' && puedeEditar && new Date(garantia.fechaFin) >= hoy && (
          <button
            type="button"
            onClick={() => changeEstado.mutate({ id: garantia.id, payload: { estado: 'ACTIVA' } })}
            className="w-full text-xs font-medium text-graphite-500 hover:text-graphite-900"
          >
            Reactivar garantía
          </button>
        )}
        {msg(changeEstado.error) && <p className="text-xs text-red-600">{msg(changeEstado.error)}</p>}

        <ReclamoModal
          open={reclamoOpen}
          onClose={() => setReclamoOpen(false)}
          codigoOrden={orden.codigoOrden}
          isPending={reclamar.isPending}
          error={msg(reclamar.error)}
          onOpen={() => reclamar.reset()}
          onConfirm={(payload) =>
            reclamar.mutate(
              { id: garantia.id, payload },
              { onSuccess: (r) => (window.location.href = `/reparaciones/${r.ordenId}`) },
            )
          }
        />
        <ConfirmDialog
          open={anularOpen}
          onClose={() => setAnularOpen(false)}
          title="Anular garantía"
          description="La garantía dejará de cubrir esta reparación (por ejemplo, si el equipo fue manipulado por terceros). Se puede reactivar mientras no haya vencido."
          confirmLabel="Anular"
          isLoading={changeEstado.isPending}
          onConfirm={() =>
            changeEstado.mutate({ id: garantia.id, payload: { estado: 'ANULADA' } }, { onSuccess: () => setAnularOpen(false) })
          }
        />
      </div>
    );
  }

  if (['CANCELADO', 'NO_REPARABLE'].includes(orden.estado.nombre)) {
    return <p className="text-sm text-graphite-400">No aplica: el equipo no fue reparado.</p>;
  }
  // Antes de entregar: la garantía que definió el técnico al terminar.
  if (orden.estado.nombre !== 'ENTREGADO') {
    return <GarantiaDefinida orden={orden} porDefecto={config?.garantiaDiasDefault ?? 30} condicionesGenerales={config?.garantiaCondiciones} />;
  }
  // Entregada sin garantía: solo técnico/administrador pueden dársela.
  if (!puedeEditar) {
    return <p className="text-sm text-graphite-400">Se entregó sin garantía.</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (dias && dias > 0) create.mutate({ ordenId: orden.id, dias });
      }}
      className="space-y-2"
    >
      <p className="text-sm text-graphite-500">Se entregó sin garantía. Puedes registrarla ahora:</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={730}
          value={dias ?? 30}
          onChange={(e) => setDias(Math.max(1, Math.trunc(Number(e.target.value))))}
          className="w-24 rounded-md border border-graphite-200 px-2 py-1.5 text-sm"
        />
        <span className="text-sm text-graphite-500">días desde la entrega</span>
      </div>
      {msg(create.error) && <p className="text-xs text-red-600">{msg(create.error)}</p>}
      <button
        type="submit"
        disabled={create.isPending}
        className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm font-medium text-graphite-700 hover:bg-graphite-50 disabled:opacity-50"
      >
        {create.isPending ? 'Registrando…' : 'Registrar garantía'}
      </button>
    </form>
  );
}

/**
 * Garantía decidida al terminar la reparación (antes de la entrega). La ve
 * todo el mundo; la define o corrige quien puede editar la orden (técnico
 * o administrador). Al entregar se crea con estos datos.
 */
function GarantiaDefinida({
  orden,
  porDefecto,
  condicionesGenerales,
}: {
  orden: OrdenReparacion;
  porDefecto: number;
  condicionesGenerales?: string | null;
}) {
  const { definirGarantia } = useReparacionMutations(orden.id);
  const puedeDefinir = usePermiso('reparaciones:editar');
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState<GarantiaValor | null>(null);
  const definida = orden.garantiaDias !== null && orden.garantiaDias !== undefined;
  const lista = orden.estado.nombre === 'LISTO_ENTREGA';
  const actual = valor ?? garantiaInicial(orden.garantiaDias, orden.garantiaCondiciones, porDefecto);

  if (editando) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!garantiaValida(actual)) return;
          definirGarantia.mutate(garantiaPayload(actual), {
            onSuccess: () => {
              setEditando(false);
              setValor(null);
            },
          });
        }}
        className="space-y-3"
      >
        <GarantiaCampos valor={actual} onChange={setValor} condicionesGenerales={condicionesGenerales} />
        {msg(definirGarantia.error) && <p className="text-xs text-red-600">{msg(definirGarantia.error)}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setEditando(false);
              setValor(null);
              definirGarantia.reset();
            }}
            className="flex-1 rounded-md px-3 py-2 text-sm font-medium text-graphite-600 hover:bg-graphite-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={definirGarantia.isPending || !garantiaValida(actual)}
            className="flex-1 rounded-md bg-graphite-900 px-3 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-50"
          >
            {definirGarantia.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    );
  }

  if (!definida) {
    return (
      <div className="space-y-2 text-sm">
        {lista ? (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-amber-800">
            Falta definir la garantía. Sin ella el equipo no se puede entregar.
            {!puedeDefinir && ' Pídele al técnico que la indique.'}
          </p>
        ) : (
          <p className="text-graphite-400">La define el técnico al terminar la reparación.</p>
        )}
        {puedeDefinir && lista && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="w-full rounded-md bg-graphite-900 px-3 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
          >
            Definir garantía
          </button>
        )}
      </div>
    );
  }

  const quien = orden.garantiaDefinidaPor
    ? [orden.garantiaDefinidaPor.nombre, orden.garantiaDefinidaPor.apellido].filter(Boolean).join(' ')
    : null;

  return (
    <div className="space-y-2 text-sm">
      {orden.garantiaDias! > 0 ? (
        <p className="font-medium text-graphite-900">
          {orden.garantiaDias} {orden.garantiaDias === 1 ? 'día' : 'días'} desde la entrega
        </p>
      ) : (
        <p className="font-medium text-graphite-900">Sin garantía</p>
      )}
      {orden.garantiaDias! > 0 && (orden.garantiaCondiciones || condicionesGenerales) && (
        <p className="text-xs text-graphite-500">{orden.garantiaCondiciones || condicionesGenerales}</p>
      )}
      {quien && (
        <p className="text-xs text-graphite-400">
          Definida por {quien}
          {orden.garantiaDefinidaEn ? ` el ${formatFecha(orden.garantiaDefinidaEn)}` : ''}
        </p>
      )}
      {puedeDefinir && (
        <button type="button" onClick={() => setEditando(true)} className="text-xs font-medium text-graphite-500 hover:text-graphite-900">
          Modificar garantía
        </button>
      )}
    </div>
  );
}

function ReclamoModal({
  open,
  onClose,
  codigoOrden,
  onConfirm,
  onOpen,
  isPending,
  error,
}: {
  open: boolean;
  onClose: () => void;
  codigoOrden: string;
  onConfirm: (p: { fallaReportada: string; observaciones?: string }) => void;
  onOpen: () => void;
  isPending: boolean;
  error: string | null;
}) {
  const [falla, setFalla] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    if (!open) return;
    setFalla('');
    setObservaciones('');
    onOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (falla.trim()) onConfirm({ fallaReportada: falla.trim(), observaciones: observaciones.trim() || undefined });
  }

  return (
    <Modal open={open} onClose={onClose} title="Atender por garantía">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-graphite-600">
          Se abrirá una <strong>orden nueva</strong> del mismo cliente y equipo, enlazada a {codigoOrden}, con prioridad
          alta y sin costo. Si hubiera algo no cubierto, se cotiza con un presupuesto como siempre.
        </p>
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            ¿Qué falla reporta el cliente? <span className="text-red-500">*</span>
          </label>
          <textarea rows={3} autoFocus value={falla} onChange={(e) => setFalla(e.target.value)} className={`${inputCls} resize-none`} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Observaciones</label>
          <textarea rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className={`${inputCls} resize-none`} />
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-graphite-600 hover:bg-graphite-50">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending || !falla.trim()}
            className="rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-50"
          >
            {isPending ? 'Creando orden…' : 'Crear orden de garantía'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
