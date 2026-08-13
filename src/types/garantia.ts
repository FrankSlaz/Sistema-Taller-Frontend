/**
 * Espejo de backend-nest/src/modules/garantias
 * Relación 1-1 con OrdenReparacion. Solo puede crearse si la orden ya
 * tiene una Entrega registrada. fechaInicio/fechaFin se calculan en
 * el backend a partir de la fecha de entrega + días de garantía.
 */

export const ESTADOS_GARANTIA = ['ACTIVA', 'VENCIDA', 'ANULADA'] as const;
export type EstadoGarantia = (typeof ESTADOS_GARANTIA)[number];

export interface GarantiaOrdenRef {
  id: number;
  codigoOrden: string;
}

export interface Garantia {
  id: number;
  ordenId: number;
  orden?: GarantiaOrdenRef;
  dias: number;
  fechaInicio: string;
  fechaFin: string;
  descripcion?: string | null;
  condiciones?: string | null;
  estado: EstadoGarantia | string;
  createdAt: string;
}

export interface CreateGarantiaPayload {
  ordenId: number;
  dias: number;
  descripcion?: string;
  condiciones?: string;
}

export interface ChangeEstadoGarantiaPayload {
  estado: EstadoGarantia;
}

export interface GarantiasQuery {
  page?: number;
  limit?: number;
}
