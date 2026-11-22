import { useMutation, useQuery } from '@tanstack/react-query';
import { Ban, FileDown, MessageCircle, Plus, Undo2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../../ui/Modal';
import MotivoDialog from '../../ui/MotivoDialog';
import PagoFormModal from '../../forms/PagoFormModal';
import { usePagoMutations, usePagos } from '../../../../lib/hooks/usePagos';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import { pagosApi } from '../../../../lib/api/pagos';
import { linkWhatsapp, seguimientoApi, type EnlaceSeguimiento } from '../../../../lib/api/seguimiento';
import { ApiError } from '../../../../lib/api/client';
import type { OrdenReparacion } from '../../../../types/reparacion';
import { METODOS_PAGO, type MetodoPago, type Pago, type PagosResumen } from '../../../../types/pago';

const bs = (value: string | number) => {
  const num = typeof value === 'string' ? Number(value) : value;
  return `Bs ${Number.isFinite(num) ? num.toFixed(2) : '0.00'}`;
};
const msg = (e: unknown) => (e instanceof ApiError ? e.message : e ? 'Error inesperado' : null);

function formatFechaHora(value: string) {
  return new Date(value).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Mensaje de WhatsApp con el comprobante del pago para el cliente. */
function mensajeRecibo(e: EnlaceSeguimiento, p: Pago, r?: PagosResumen) {
  const devolucion = p.tipo === 'DEVOLUCION';
  return [
    `Hola ${e.cliente.nombre}, ${e.nombreTaller} ${devolucion ? 'le confirma la devolución' : 'confirma la recepción'} de *${bs(p.monto)}* (${p.metodoPago ?? 'pago'}) por la orden ${e.codigoOrden}.`,
    `Comprobante N.º ${pagosApi.numeroRecibo(p)}.`,
    ...(r
      ? [r.saldoAFavor > 0 ? `Saldo a su favor: ${bs(r.saldoAFavor)}.` : `Saldo pendiente: ${bs(r.saldoPendiente)}.`]
      : []),
    '',
    `Puede ver el estado de su reparación aquí: ${e.url}`,
    '',
    'Gracias por confiar en nuestros servicios.',
  ].join('\n');
}

export default function PagosPanel({ orden }: { orden: OrdenReparacion }) {
  const { data } = usePagos({ ordenId: orden.id, limit: 50, incluirAnulados: true });
  const { anular, devolver } = usePagoMutations(orden.id);
  const puedeCrear = usePermiso('pagos:crear');
  const puedeDevolver = usePermiso('pagos:editar');
  const puedeAnular = usePermiso('pagos:eliminar');
  const { data: enlace } = useQuery({
    queryKey: ['reparaciones', 'seguimiento', orden.id],
    queryFn: () => seguimientoApi.enlace(orden.id),
  });
  const recibo = useMutation({ mutationFn: (p: Pago) => pagosApi.recibo(p) });

  const [formOpen, setFormOpen] = useState(false);
  const [devolucionOpen, setDevolucionOpen] = useState(false);
  const [anularTarget, setAnularTarget] = useState<Pago | null>(null);

  const pagos = data?.items ?? [];
  const resumen = data?.resumen;

  return (
    <div className="space-y-3">
      {resumen && (
        <div className="grid grid-cols-3 gap-2 rounded-md bg-graphite-50 p-3 text-center">
          <div>
            <p className="text-xs text-graphite-400">Total orden</p>
            <p className="font-display text-sm font-semibold text-graphite-900">{bs(resumen.totalOrden)}</p>
          </div>
          <div>
            <p className="text-xs text-graphite-400">Pagado</p>
            <p className="font-display text-sm font-semibold text-green-700">{bs(resumen.totalPagado)}</p>
          </div>
          <div>
            <p className="text-xs text-graphite-400">{resumen.saldoAFavor > 0 ? 'A favor del cliente' : 'Saldo pendiente'}</p>
            <p
              className={`font-display text-sm font-semibold ${
                resumen.saldoAFavor > 0 ? 'text-blue-700' : resumen.saldoPendiente > 0 ? 'text-amber-700' : 'text-graphite-900'
              }`}
            >
              {bs(resumen.saldoAFavor > 0 ? resumen.saldoAFavor : resumen.saldoPendiente)}
            </p>
          </div>
        </div>
      )}

      {resumen && resumen.saldoAFavor > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-900">
          <span>El cliente pagó {bs(resumen.saldoAFavor)} de más.</span>
          {puedeDevolver && (
            <button
              type="button"
              onClick={() => setDevolucionOpen(true)}
              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 font-semibold text-white hover:bg-blue-700"
            >
              <Undo2 size={12} />
              Registrar devolución
            </button>
          )}
        </div>
      )}

      <ul className="space-y-2">
        {pagos.length === 0 && <li className="text-sm text-graphite-400">Sin pagos registrados.</li>}
        {pagos.map((p) => {
          const devolucion = p.tipo === 'DEVOLUCION';
          return (
            <li
              key={p.id}
              className={`rounded-md border p-3 text-sm ${p.anulado ? 'border-graphite-100 bg-graphite-50/70' : 'border-graphite-100'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`font-medium ${p.anulado ? 'text-graphite-400 line-through' : 'text-graphite-900'}`}>
                    {devolucion ? '− ' : ''}
                    {bs(p.monto)} <span className="text-xs font-normal text-graphite-400">{p.metodoPago}</span>
                    {devolucion && (
                      <span className="ml-1.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-blue-700 no-underline">
                        Devolución
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-graphite-400">
                    {formatFechaHora(p.fecha)} · {pagosApi.numeroRecibo(p)}
                    {p.referencia && ` · Ref: ${p.referencia}`}
                    {p.usuario && ` · ${p.usuario.nombre}`}
                  </p>
                  {p.observacion && <p className="text-graphite-600">{p.observacion}</p>}
                  {p.anulado && (
                    <p className="mt-1 text-xs text-red-700">
                      Anulado{p.anuladoPor && ` por ${p.anuladoPor.nombre}`}
                      {p.fechaAnulacion && ` el ${formatFechaHora(p.fechaAnulacion)}`}: {p.motivoAnulacion}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => recibo.mutate(p)}
                    className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-100 hover:text-graphite-900"
                    aria-label="Descargar recibo"
                    title="Recibo (PDF)"
                  >
                    <FileDown size={14} />
                  </button>
                  {!p.anulado && enlace && (
                    <a
                      href={linkWhatsapp(enlace, mensajeRecibo(enlace, p, resumen))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md p-1.5 text-graphite-400 hover:bg-green-50 hover:text-green-700"
                      aria-label="Enviar comprobante por WhatsApp"
                      title="Enviar comprobante por WhatsApp"
                    >
                      <MessageCircle size={14} />
                    </a>
                  )}
                  {!p.anulado && puedeAnular && (
                    <button
                      type="button"
                      onClick={() => setAnularTarget(p)}
                      className="rounded-md p-1.5 text-graphite-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Anular"
                      title="Anular"
                    >
                      <Ban size={14} />
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {msg(recibo.error) && <p className="text-xs text-red-600">{msg(recibo.error)}</p>}

      {puedeCrear && !(resumen && resumen.totalOrden > 0 && resumen.saldoPendiente <= 0) && (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite-900 hover:underline"
        >
          <Plus size={15} />
          Registrar pago
        </button>
      )}

      <PagoFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaultOrdenId={orden.id}
        defaultOrdenLabel={orden.codigoOrden}
        defaultMonto={resumen && resumen.saldoPendiente > 0 ? resumen.saldoPendiente : undefined}
      />

      <DevolucionModal
        open={devolucionOpen}
        onClose={() => setDevolucionOpen(false)}
        maximo={resumen?.saldoAFavor ?? 0}
        isPending={devolver.isPending}
        error={msg(devolver.error)}
        onConfirm={(datos) =>
          devolver.mutate({ ordenId: orden.id, ...datos }, { onSuccess: () => setDevolucionOpen(false) })
        }
        onOpen={() => devolver.reset()}
      />

      <MotivoDialog
        open={!!anularTarget}
        onClose={() => setAnularTarget(null)}
        title={anularTarget?.tipo === 'DEVOLUCION' ? 'Anular devolución' : 'Anular pago'}
        description={`Se anulará ${anularTarget ? bs(anularTarget.monto) : ''} (${anularTarget ? pagosApi.numeroRecibo(anularTarget) : ''}). Quedará visible y tachado, pero dejará de contar en el saldo y en la caja.`}
        confirmLabel="Anular"
        isLoading={anular.isPending}
        error={msg(anular.error)}
        onConfirm={(motivo) =>
          anularTarget && anular.mutate({ id: anularTarget.id, motivo }, { onSuccess: () => setAnularTarget(null) })
        }
      />
    </div>
  );
}

function DevolucionModal({
  open,
  onClose,
  maximo,
  onConfirm,
  onOpen,
  isPending,
  error,
}: {
  open: boolean;
  onClose: () => void;
  maximo: number;
  onConfirm: (d: { monto: number; metodoPago: MetodoPago; observacion?: string }) => void;
  onOpen: () => void;
  isPending: boolean;
  error: string | null;
}) {
  const [monto, setMonto] = useState(0);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [observacion, setObservacion] = useState('');

  useEffect(() => {
    if (!open) return;
    setMonto(maximo);
    setMetodoPago('EFECTIVO');
    setObservacion('');
    onOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (monto > 0 && monto <= maximo + 0.001) onConfirm({ monto, metodoPago, observacion: observacion || undefined });
  }

  const inputCls =
    'w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800';

  return (
    <Modal open={open} onClose={onClose} title="Registrar devolución">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-graphite-600">
          Devuelve al cliente el dinero que pagó de más. Saldo a favor: <strong>{bs(maximo)}</strong>.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Monto</label>
            <input
              type="number"
              min={0.01}
              max={maximo}
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Método</label>
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value as MetodoPago)} className={inputCls}>
              {METODOS_PAGO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Observación</label>
          <input
            type="text"
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Ej. Presupuesto adicional rechazado"
            className={inputCls}
          />
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-graphite-600 hover:bg-graphite-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending || monto <= 0 || monto > maximo + 0.001}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Registrando…' : 'Registrar devolución'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
