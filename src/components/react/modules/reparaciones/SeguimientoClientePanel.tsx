import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, ExternalLink, FileDown, Loader2, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { linkWhatsapp, seguimientoApi } from '../../../../lib/api/seguimiento';
import { ApiError } from '../../../../lib/api/client';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import type { OrdenReparacion } from '../../../../types/reparacion';

const msg = (e: unknown) => (e instanceof ApiError ? e.message : e ? 'Error inesperado' : null);

/**
 * Seguimiento del cliente: QR y enlace privado (/s/<token>) de la orden,
 * envío por WhatsApp con mensaje preparado, comprobante de recepción en PDF
 * y opción de regenerar el enlace (invalida el anterior).
 */
export default function SeguimientoClientePanel({ orden }: { orden: OrdenReparacion }) {
  const queryClient = useQueryClient();
  const puedeRegenerar = usePermiso('reparaciones:editar');
  const [qr, setQr] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [confirmar, setConfirmar] = useState(false);

  const { data: enlace, isLoading, error } = useQuery({
    queryKey: ['reparaciones', 'seguimiento', orden.id],
    queryFn: () => seguimientoApi.enlace(orden.id),
  });

  const regenerar = useMutation({
    mutationFn: () => seguimientoApi.regenerar(orden.id),
    onSuccess: (nuevo) => {
      queryClient.setQueryData(['reparaciones', 'seguimiento', orden.id], nuevo);
      setConfirmar(false);
    },
  });
  const comprobante = useMutation({ mutationFn: () => seguimientoApi.comprobante(orden.id, orden.codigoOrden) });

  useEffect(() => {
    if (!enlace) return;
    QRCode.toDataURL(enlace.url, { width: 360, margin: 1, errorCorrectionLevel: 'M' })
      .then(setQr)
      .catch(() => setQr(null));
  }, [enlace]);

  async function copiar() {
    if (!enlace) return;
    try {
      await navigator.clipboard.writeText(enlace.url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt('Copia el enlace:', enlace.url);
    }
  }

  if (isLoading) return <div className="h-48 animate-pulse rounded-md bg-graphite-100" />;
  if (error || !enlace) return <p className="text-sm text-red-600">{msg(error) ?? 'No se pudo cargar el enlace.'}</p>;

  const errorAccion = msg(comprobante.error ?? regenerar.error);

  return (
    <div className="space-y-3">
      <p className="text-xs text-graphite-500">
        El cliente ve el estado, el diagnóstico y el saldo de su orden desde el celular, sin registrarse.
      </p>

      <div className="flex justify-center rounded-lg border border-graphite-100 bg-white p-2">
        {qr ? (
          <img src={qr} alt={`Código QR del seguimiento de ${enlace.codigoOrden}`} className="h-40 w-40" />
        ) : (
          <div className="h-40 w-40 animate-pulse rounded bg-graphite-100" />
        )}
      </div>

      <div className="flex items-center gap-1 rounded-md border border-graphite-200 bg-graphite-50 px-2 py-1.5">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-graphite-600" title={enlace.url}>
          {enlace.url}
        </span>
        <button
          type="button"
          onClick={copiar}
          className="rounded p-1 text-graphite-500 hover:bg-graphite-200 hover:text-graphite-900"
          aria-label="Copiar enlace"
          title="Copiar enlace"
        >
          {copiado ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
        </button>
        <a
          href={enlace.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded p-1 text-graphite-500 hover:bg-graphite-200 hover:text-graphite-900"
          aria-label="Abrir página del cliente"
          title="Abrir página del cliente"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      <a
        href={linkWhatsapp(enlace)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1fa855] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1a9049]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.6-1.3a.4.4 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z" />
        </svg>
        Enviar por WhatsApp
      </a>
      {!enlace.cliente.whatsapp && (
        <p className="text-xs text-amber-700">
          {enlace.cliente.telefono
            ? `El teléfono del cliente (${enlace.cliente.telefono}) no parece un celular: WhatsApp te pedirá elegir el contacto.`
            : 'El cliente no tiene teléfono registrado: WhatsApp te pedirá elegir el contacto.'}
        </p>
      )}

      <button
        type="button"
        onClick={() => comprobante.mutate()}
        disabled={comprobante.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-graphite-200 px-3 py-2 text-sm font-medium text-graphite-700 hover:bg-graphite-50 disabled:opacity-60"
      >
        {comprobante.isPending ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
        Comprobante con QR (PDF)
      </button>

      {puedeRegenerar && (
        <button
          type="button"
          onClick={() => setConfirmar(true)}
          className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-graphite-500 hover:text-graphite-900"
        >
          <RefreshCw size={12} />
          Regenerar enlace
        </button>
      )}

      {errorAccion && <p className="rounded-md bg-red-50 px-2.5 py-1.5 text-xs text-red-700">{errorAccion}</p>}

      <ConfirmDialog
        open={confirmar}
        onClose={() => setConfirmar(false)}
        title="Regenerar enlace de seguimiento"
        description="El enlace y el QR actuales dejarán de funcionar (incluido el del comprobante ya impreso). Úsalo solo si el enlace se compartió con alguien que no debía tenerlo."
        confirmLabel="Regenerar"
        isLoading={regenerar.isPending}
        onConfirm={() => regenerar.mutate()}
      />
    </div>
  );
}
