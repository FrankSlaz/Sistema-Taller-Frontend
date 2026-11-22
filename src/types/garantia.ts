/**
 * Espejo de backend-nest/src/modules/garantias
 * Se crea automáticamente al entregar (días de Configuración). Vence sola
 * (estado efectivo) y permite "atender por garantía": abre una orden nueva
 * enlazada a la original.
 */

export const ESTADOS_GARANTIA = ['ACTIVA', 'VENCIDA', 'ANULADA'] as const;
export type EstadoGarantia = (typeof ESTADOS_GARANTIA)[number];

export interface ReclamoRef {
  id: number;
  codigoOrden: string;
  fechaIngreso: string | null;
  estado: { nombre: string };
}

export interface GarantiaOrdenRef {
  id: number;
  codigoOrden: string;
  clienteId?: number;
  equipoId?: number;
  cliente?: { nombre: string; telefono?: string | null };
  equipo?: { tipoEquipo: string; marca?: string | null; modelo?: string | null };
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
  /** Estado real (una ACTIVA con fecha pasada es VENCIDA). Lo calcula el backend. */
  estadoEfectivo?: EstadoGarantia | string;
  diasRestantes?: number | null;
  porVencer?: boolean;
  reclamos?: ReclamoRef[];
}

export interface CreateGarantiaPayload {
  ordenId: number;
  /** Si se omite, los días por defecto de Configuración. */
  dias?: number;
  descripcion?: string;
  condiciones?: string;
}

export interface ChangeEstadoGarantiaPayload {
  estado: EstadoGarantia;
}

export interface ReclamoGarantiaPayload {
  fallaReportada: string;
  observaciones?: string;
}

export type FiltroGarantia = 'ACTIVA' | 'POR_VENCER' | 'VENCIDA' | 'ANULADA';

export interface GarantiasQuery {
  page?: number;
  limit?: number;
  estado?: FiltroGarantia;
  search?: string;
}

export interface GarantiasResumen {
  activas: number;
  porVencer: number;
  vencidas: number;
  anuladas: number;
}
