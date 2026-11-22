import { useEffect, useState, type FormEvent } from 'react';
import PagoFormModal from './PagoFormModal';
import { useEntregaMutations } from '../../../lib/hooks/useEntregas';
import { usePagos } from '../../../lib/hooks/usePagos';
import { useConfiguracion } from '../../../lib/hooks/useConfiguracion';
import { ApiError } from '../../../lib/api/client';
import type { OrdenReparacion } from '../../../types/reparacion';
import type { EntregaCreada } from '../../../types/entrega';

const inputCls =
  'w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800';
const bs = (n: number) => `Bs ${n.toFixed(2)}`;
const DEVOLUCION = ['CANCELADO', 'NO_REPARABLE'];

/**
 * Formulario de entrega con las reglas del taller (las mismas que valida
 * el backend):
 * - Solo se entrega desde "Listo para entrega"; las canceladas y no
 *   reparables se DEVUELVEN (sin garantía).
 * - El saldo tiene que estar en cero: si debe, se pide registrar el pago.
 * - Quién retira es obligatorio (atajo: lo retira el titular).
 * - La garantía la definió el técnico/administrador al terminar la
 *   reparación: aquí solo se muestra (para informar al cliente).
 */
export default function EntregaForm({
  orden,
  onDone,
}: {
  orden: OrdenReparacion;
  onDone?: (entrega: EntregaCreada) => void;
}) {
  const { create } = useEntregaMutations(orden.id);
  const { data: pagos, isLoading: cargandoPagos } = usePagos({ ordenId: orden.id, limit: 1 });
  const { data: config } = useConfiguracion();

  const documentoTitular = [orden.cliente.tipoDocumento, orden.cliente.numeroDocumento].filter(Boolean).join(' ');
  const [esTitular, setEsTitular] = useState(true);
  const [nombreRecibe, setNombreRecibe] = useState('');
  const [documentoRecibe, setDocumentoRecibe] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [pagoOpen, setPagoOpen] = useState(false);

  const estado = orden.estado.nombre;
  const reparada = estado === 'LISTO_ENTREGA';
  const devolucion = DEVOLUCION.includes(estado);

  // Datos del titular / garantía por defecto al cargar.
  useEffect(() => {
    if (esTitular) {
      setNombreRecibe(orden.cliente.nombre);
      setDocumentoRecibe(documentoTitular);
    }
  }, [esTitular, orden.cliente.nombre, documentoTitular]);

  if (!reparada && !devolucion) {
    return (
      <p className="rounded-md bg-graphite-50 px-3 py-2 text-sm text-graphite-600">
        La orden se entrega cuando esté en <strong>Listo para entrega</strong> (estado actual:{' '}
        {orden.estado.nombre.replace(/_/g, ' ').toLowerCase()}).
      </p>
    );
  }

  const resumen = pagos?.resumen;
  const saldo = resumen?.saldoPendiente ?? 0;
  const aFavor = resumen?.saldoAFavor ?? 0;
  const bloqueadoPorSaldo = saldo > 0.009;
  const faltanDatos = !nombreRecibe.trim() || !documentoRecibe.trim();
  const diasGarantia = orden.garantiaDias;
  const sinDefinirGarantia = reparada && (diasGarantia === null || diasGarantia === undefined);
  const venceGarantia = diasGarantia ? new Date(Date.now() + diasGarantia * 24 * 60 * 60 * 1000) : null;
  const condicionesGarantia = orden.garantiaCondiciones || config?.garantiaCondiciones;
  const errorMessage = create.error instanceof ApiError ? create.error.message : create.error ? 'Error inesperado' : null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (bloqueadoPorSaldo || faltanDatos || sinDefinirGarantia) return;
    create.mutate(
      {
        ordenId: orden.id,
        nombreRecibe: nombreRecibe.trim(),
        documentoRecibe: documentoRecibe.trim(),
        observaciones: observaciones.trim() || undefined,
      },
      { onSuccess: (e) => onDone?.(e) },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {devolucion && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Orden {estado === 'CANCELADO' ? 'cancelada' : 'no reparable'}: se registra la <strong>devolución</strong> del
          equipo, sin garantía.
        </p>
      )}

      {/* Saldo: un equipo no se entrega sin estar pagado */}
      {cargandoPagos ? (
        <div className="h-10 animate-pulse rounded-md bg-graphite-100" />
      ) : bloqueadoPorSaldo ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <p>
            Saldo pendiente: <strong>{bs(saldo)}</strong>. El equipo no se puede entregar hasta que esté pagado.
          </p>
          <button
            type="button"
            onClick={() => setPagoOpen(true)}
            className="mt-2 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            Registrar pago
          </button>
        </div>
      ) : (
        <p className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-800">
          ✓ Pagado por completo{resumen && resumen.totalOrden > 0 ? ` (${bs(resumen.totalPagado)})` : ''}.
          {aFavor > 0 && (
            <span className="block text-amber-800">
              El cliente tiene {bs(aFavor)} a favor: registra la devolución en Pagos.
            </span>
          )}
        </p>
      )}

      <label className="flex items-center gap-2 text-sm text-graphite-800">
        <input type="checkbox" checked={esTitular} onChange={(e) => setEsTitular(e.target.checked)} />
        Lo retira el titular ({orden.cliente.nombre})
      </label>
      {!esTitular && (
        <p className="text-xs text-graphite-500">Escribe los datos de la persona que retira en su nombre.</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-graphite-900">
            Nombre de quien retira <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nombreRecibe}
            onChange={(e) => setNombreRecibe(e.target.value)}
            disabled={esTitular}
            className={`${inputCls} disabled:bg-graphite-50`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-graphite-900">
            Documento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={documentoRecibe}
            onChange={(e) => setDocumentoRecibe(e.target.value)}
            disabled={esTitular && !!documentoTitular}
            placeholder="CI"
            className={`${inputCls} disabled:bg-graphite-50`}
          />
          {esTitular && !documentoTitular && (
            <p className="mt-1 text-xs text-amber-700">El cliente no tiene documento registrado: escríbelo.</p>
          )}
        </div>
      </div>

      {/* Garantía: la definió el técnico al terminar; aquí solo se informa. */}
      {reparada &&
        (sinDefinirGarantia ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            El técnico aún no definió la garantía de esta reparación. Pídele que la indique en el panel{' '}
            <strong>Garantía</strong> de la orden antes de entregar.
          </p>
        ) : diasGarantia! > 0 ? (
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-900">
            <p>
              <strong>Garantía: {diasGarantia} {diasGarantia === 1 ? 'día' : 'días'}</strong>
              {venceGarantia &&
                ` (hasta el ${venceGarantia.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })})`}
            </p>
            {condicionesGarantia && <p className="mt-0.5 text-xs text-blue-800">{condicionesGarantia}</p>}
            <p className="mt-1 text-[11px] text-blue-700">Infórmasela al cliente: también sale impresa en el acta.</p>
          </div>
        ) : (
          <p className="rounded-md border border-graphite-200 bg-graphite-50 px-3 py-2 text-sm text-graphite-700">
            <strong>Se entrega sin garantía.</strong> Infórmaselo al cliente.
          </p>
        ))}

      <div>
        <label className="mb-1 block text-xs font-medium text-graphite-900">Observaciones</label>
        <textarea
          rows={2}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className={`${inputCls} resize-none`}
        />
      </div>

      {errorMessage && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}

      <button
        type="submit"
        disabled={create.isPending || bloqueadoPorSaldo || faltanDatos || cargandoPagos || sinDefinirGarantia}
        className="w-full rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-50"
      >
        {create.isPending ? 'Registrando…' : devolucion ? 'Registrar devolución' : 'Registrar entrega'}
      </button>

      <PagoFormModal
        open={pagoOpen}
        onClose={() => setPagoOpen(false)}
        defaultOrdenId={orden.id}
        defaultOrdenLabel={orden.codigoOrden}
        defaultMonto={saldo > 0 ? Math.round(saldo * 100) / 100 : undefined}
      />
    </form>
  );
}
