import { api, downloadFile } from './client';

/** GET /reparaciones/:id/seguimiento */
export interface EnlaceSeguimiento {
  codigoOrden: string;
  url: string;
  nombreTaller: string;
  cliente: {
    nombre: string;
    telefono: string | null;
    /** Teléfono normalizado para wa.me (591…), o null si no es celular. */
    whatsapp: string | null;
  };
}

export const seguimientoApi = {
  enlace: (ordenId: number) => api.get<EnlaceSeguimiento>(`/reparaciones/${ordenId}/seguimiento`),

  regenerar: (ordenId: number) => api.post<EnlaceSeguimiento>(`/reparaciones/${ordenId}/seguimiento/regenerar`),

  comprobante: (ordenId: number, codigoOrden: string) =>
    downloadFile(`/reparaciones/${ordenId}/comprobante`, `orden-${codigoOrden}.pdf`),
};

/** Mensaje de WhatsApp para el cliente, con el enlace de seguimiento. */
export function mensajeWhatsapp(e: EnlaceSeguimiento) {
  return (
    `Estimado cliente, ${e.nombreTaller} le informa que puede consultar el estado y avance ` +
    `de la reparación de su equipo (orden ${e.codigoOrden}) mediante el siguiente enlace:\n\n` +
    `${e.url}\n\nGracias por confiar en nuestros servicios.`
  );
}

/** wa.me con el mensaje; sin número válido, WhatsApp pide elegir el contacto. */
export function linkWhatsapp(e: EnlaceSeguimiento, mensaje: string = mensajeWhatsapp(e)) {
  const texto = encodeURIComponent(mensaje);
  return e.cliente.whatsapp ? `https://wa.me/${e.cliente.whatsapp}?text=${texto}` : `https://wa.me/?text=${texto}`;
}

const bs = (n: number | string | null | undefined) => `Bs ${Number(n ?? 0).toFixed(2)}`;

/** Mensaje con el presupuesto para que el cliente lo apruebe respondiendo. */
export function mensajePresupuesto(
  e: EnlaceSeguimiento,
  p: { descripcion?: string | null; costoManoObra?: number | string | null; costoRepuestos?: number | string | null; totalEstimado?: number | string | null },
) {
  return [
    `Estimado cliente, ${e.nombreTaller} le envía el presupuesto para la reparación de su equipo (orden ${e.codigoOrden}):`,
    '',
    ...(p.descripcion ? [`• ${p.descripcion}`] : []),
    `Mano de obra: ${bs(p.costoManoObra)}`,
    `Repuestos: ${bs(p.costoRepuestos)}`,
    `*Total: ${bs(p.totalEstimado)}*`,
    '',
    'Para aprobarlo, responda a este mensaje con *APRUEBO*. Puede ver el avance de su reparación aquí:',
    e.url,
    '',
    'Gracias por confiar en nuestros servicios.',
  ].join('\n');
}
