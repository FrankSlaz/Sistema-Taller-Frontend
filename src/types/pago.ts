/**
 * Espejo de backend-nest/src/modules/pagos
 * Solo GET/POST/DELETE — no hay endpoint de edición (un pago no se
 * "corrige", se elimina y se registra de nuevo si hubo un error).
 */

export const METODOS_PAGO = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'QR'] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

export interface PagoOrdenRef {
  id: number;
  codigoOrden: string;
  total: string | number;
}

export interface Pago {
  id: number;
  ordenId: number;
  orden?: PagoOrdenRef;
  monto: string | number;
  metodoPago?: MetodoPago | string | null;
  referencia?: string | null;
  observacion?: string | null;
  fecha: string;
}

export interface CreatePagoPayload {
  ordenId: number;
  monto: number;
  metodoPago?: MetodoPago;
  referencia?: string;
  observacion?: string;
}

export interface PagosQuery {
  page?: number;
  limit?: number;
  ordenId?: number;
}

export interface PagosResumen {
  totalOrden: number;
  totalPagado: number;
  saldoPendiente: number;
}
