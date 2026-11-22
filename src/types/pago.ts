/**
 * Espejo de backend-nest/src/modules/pagos
 * Un pago no se borra ni se edita: se ANULA con motivo (queda tachado y
 * deja de contar). Una DEVOLUCION devuelve al cliente un saldo a favor.
 * Pagado neto = pagos válidos − devoluciones válidas.
 */

export const METODOS_PAGO = ['EFECTIVO', 'TRANSFERENCIA', 'QR'] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

export type TipoPago = 'PAGO' | 'DEVOLUCION';

export interface PagoOrdenRef {
  id: number;
  codigoOrden: string;
  total: string | number;
  cliente?: { nombre: string };
}

export interface PagoUsuarioRef {
  id: number;
  nombre: string;
  apellido?: string | null;
}

export interface Pago {
  id: number;
  ordenId: number;
  orden?: PagoOrdenRef;
  tipo: TipoPago | string;
  monto: string | number;
  metodoPago?: MetodoPago | string | null;
  referencia?: string | null;
  observacion?: string | null;
  fecha: string;
  usuario?: PagoUsuarioRef | null;
  anulado: boolean;
  motivoAnulacion?: string | null;
  anuladoPor?: PagoUsuarioRef | null;
  fechaAnulacion?: string | null;
}

export interface CreatePagoPayload {
  ordenId: number;
  monto: number;
  metodoPago?: MetodoPago;
  referencia?: string;
  observacion?: string;
}

export type CreateDevolucionPayload = CreatePagoPayload;

export interface PagosQuery {
  page?: number;
  limit?: number;
  ordenId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  metodoPago?: string;
  usuarioId?: number;
  tipo?: TipoPago;
  incluirAnulados?: boolean;
  /** Orden, cliente, n.º de recibo, referencia u observación. */
  search?: string;
}

/** Resumen de una orden (solo cuando se filtra por ordenId). */
export interface PagosResumen {
  totalOrden: number;
  totalPagado: number;
  saldoPendiente: number;
  saldoAFavor: number;
}

/** Totales del filtro completo, para cuadrar la caja. */
export interface CajaResumen {
  ingresos: number;
  cantidadIngresos: number;
  devoluciones: number;
  cantidadDevoluciones: number;
  neto: number;
  anulados: number;
  cantidadAnulados: number;
  porMetodo: { metodoPago: string; neto: number }[];
}
