import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import OrdenSelect from './OrdenSelect';
import { usePagoMutations } from '../../../lib/hooks/usePagos';
import { useReparacion } from '../../../lib/hooks/useReparaciones';
import { pagosApi } from '../../../lib/api/pagos';
import { ApiError } from '../../../lib/api/client';
import { METODOS_PAGO, type MetodoPago, type PagosResumen } from '../../../types/pago';

interface PagoFormModalProps {
  open: boolean;
  onClose: () => void;
  defaultOrdenId?: number;
  defaultOrdenLabel?: string;
  /** Monto sugerido al abrir (p. ej. el saldo pendiente). */
  defaultMonto?: number;
}

const bs = (n: number) => `Bs ${n.toFixed(2)}`;

/** Resumen de cuenta de la orden: cuánto cuesta, cuánto pagó y cuánto falta. */
function EstadoCuenta({
  cargando,
  resumen,
  equipo,
  cancelada,
  onCobrarTodo,
}: {
  cargando: boolean;
  resumen?: PagosResumen;
  equipo: string;
  cancelada: boolean;
  onCobrarTodo?: () => void;
}) {
  if (cargando || !resumen) {
    return <div className="h-24 animate-pulse rounded-md bg-graphite-100" />;
  }

  const sinTotal = resumen.totalOrden <= 0;
  const porCobrar = resumen.saldoPendiente;

  let aviso: { tono: string; texto: string };
  if (cancelada) {
    aviso = { tono: 'bg-red-50 text-red-700', texto: 'La orden está cancelada: no admite pagos.' };
  } else if (sinTotal) {
    aviso = {
      tono: 'bg-amber-50 text-amber-800',
      texto: 'Aún no tiene presupuesto aprobado. Lo que registres quedará como adelanto.',
    };
  } else if (resumen.saldoAFavor > 0) {
    aviso = {
      tono: 'bg-blue-50 text-blue-800',
      texto: `El cliente tiene ${bs(resumen.saldoAFavor)} a favor. No hay nada por cobrar.`,
    };
  } else if (porCobrar <= 0) {
    aviso = { tono: 'bg-green-50 text-green-700', texto: 'Pagado por completo. No hay nada por cobrar.' };
  } else {
    aviso = {
      tono: 'bg-amber-50 text-amber-800',
      texto: resumen.totalPagado > 0 ? 'Tiene un pago parcial: falta cobrar el resto.' : 'Todavía no ha pagado nada.',
    };
  }

  return (
    <div className="overflow-hidden rounded-md border border-graphite-200">
      {equipo && <p className="border-b border-graphite-100 px-3 py-2 text-xs text-graphite-500">{equipo}</p>}
      <dl className="grid grid-cols-3 divide-x divide-graphite-100 text-center">
        <div className="px-2 py-2">
          <dt className="text-[11px] uppercase tracking-wide text-graphite-400">Total</dt>
          <dd className="text-sm font-semibold text-graphite-900">{sinTotal ? '—' : bs(resumen.totalOrden)}</dd>
        </div>
        <div className="px-2 py-2">
          <dt className="text-[11px] uppercase tracking-wide text-graphite-400">Pagado</dt>
          <dd className="text-sm font-semibold text-graphite-900">{bs(resumen.totalPagado)}</dd>
        </div>
        <div className="px-2 py-2">
          <dt className="text-[11px] uppercase tracking-wide text-graphite-400">Por cobrar</dt>
          <dd className={`text-sm font-semibold ${porCobrar > 0 ? 'text-amber-700' : 'text-green-700'}`}>{bs(porCobrar)}</dd>
        </div>
      </dl>
      <div className={`flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium ${aviso.tono}`}>
        <span>{aviso.texto}</span>
        {onCobrarTodo && !cancelada && (
          <button type="button" onClick={onCobrarTodo} className="shrink-0 underline hover:no-underline">
            Cobrar todo
          </button>
        )}
      </div>
    </div>
  );
}

export default function PagoFormModal({
  open,
  onClose,
  defaultOrdenId,
  defaultOrdenLabel,
  defaultMonto,
}: PagoFormModalProps) {
  const { create } = usePagoMutations(defaultOrdenId);
  const [ordenId, setOrdenId] = useState(0);
  const [ordenLabel, setOrdenLabel] = useState('');
  const [monto, setMonto] = useState(0);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [referencia, setReferencia] = useState('');
  const [observacion, setObservacion] = useState('');
  const [touched, setTouched] = useState(false);
  // Orden para la que ya se sugirió el monto (no pisar lo que escriba el usuario).
  const prefillDe = useRef(0);

  // Estado de cuenta de la orden elegida: total, pagado y saldo.
  const { data: orden } = useReparacion(open ? ordenId : 0);
  const { data: cuenta, isFetching: cargandoCuenta } = useQuery({
    queryKey: ['pagos', { ordenId, limit: 1 }],
    queryFn: () => pagosApi.findAll({ ordenId, limit: 1 }),
    enabled: open && ordenId > 0,
  });
  const resumen = cuenta?.resumen;
  const cancelada = orden?.estado?.nombre === 'CANCELADO';
  const sinTotal = !!resumen && resumen.totalOrden <= 0;
  const pagadoCompleto = !!resumen && !sinTotal && resumen.saldoPendiente <= 0;
  const excede = !!resumen && !sinTotal && monto > resumen.saldoPendiente + 0.001;
  const bloqueado = cancelada || pagadoCompleto || excede;

  useEffect(() => {
    if (!resumen || !ordenId || prefillDe.current === ordenId) return;
    prefillDe.current = ordenId;
    setMonto(resumen.saldoPendiente > 0 ? resumen.saldoPendiente : 0);
  }, [resumen, ordenId]);

  useEffect(() => {
    if (!open) return;
    setOrdenId(defaultOrdenId ?? 0);
    setOrdenLabel(defaultOrdenLabel ?? '');
    setMonto(defaultMonto ?? 0);
    setMetodoPago('EFECTIVO');
    setReferencia('');
    setObservacion('');
    setTouched(false);
    prefillDe.current = defaultMonto !== undefined ? (defaultOrdenId ?? 0) : 0;
    create.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultOrdenId]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!ordenId || monto <= 0 || bloqueado) return;

    create.mutate(
      { ordenId, monto, metodoPago, referencia: referencia || undefined, observacion: observacion || undefined },
      { onSuccess: onClose },
    );
  }

  const errorMessage =
    create.error instanceof ApiError ? create.error.message : create.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title="Registrar pago">
      <form onSubmit={handleSubmit} className="space-y-4">
        {defaultOrdenId ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Orden</label>
            <p className="rounded-md border border-graphite-100 bg-graphite-50 px-3 py-2 text-sm text-graphite-600">
              {ordenLabel || `Orden #${ordenId}`}
            </p>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">
              Orden <span className="text-red-500">*</span>
            </label>
            <OrdenSelect
              value={ordenId || null}
              initialLabel={ordenLabel}
              onChange={(id, label) => {
                setOrdenId(id);
                setOrdenLabel(label);
              }}
              error={touched && !ordenId ? 'Selecciona una orden' : undefined}
            />
          </div>
        )}

        {ordenId > 0 && (
          <EstadoCuenta
            cargando={!resumen && cargandoCuenta}
            resumen={resumen}
            equipo={orden ? [orden.equipo?.tipoEquipo, orden.equipo?.marca, orden.equipo?.modelo].filter(Boolean).join(' ') : ''}
            cancelada={cancelada}
            onCobrarTodo={resumen && resumen.saldoPendiente > 0 ? () => setMonto(resumen.saldoPendiente) : undefined}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">
              Monto <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={0.01}
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
            {touched && monto <= 0 && !pagadoCompleto && (
              <p className="mt-1 text-xs text-red-600">El monto debe ser mayor a 0</p>
            )}
            {excede && resumen && (
              <p className="mt-1 text-xs text-red-600">Supera lo que falta cobrar ({bs(resumen.saldoPendiente)})</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Método de pago</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            >
              {METODOS_PAGO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Referencia</label>
          <input
            type="text"
            maxLength={100}
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            placeholder="Ej. N.º de comprobante, N.º de transacción…"
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Observación</label>
          <textarea
            rows={2}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-graphite-600 hover:bg-graphite-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={create.isPending || bloqueado}
            className="rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
          >
            {create.isPending ? 'Registrando…' : 'Registrar pago'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
