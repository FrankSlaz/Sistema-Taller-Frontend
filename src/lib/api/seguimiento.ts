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
export function linkWhatsapp(e: EnlaceSeguimiento) {
  const texto = encodeURIComponent(mensajeWhatsapp(e));
  return e.cliente.whatsapp ? `https://wa.me/${e.cliente.whatsapp}?text=${texto}` : `https://wa.me/?text=${texto}`;
}
