/**
 * Espejo de backend-nest/src/modules/presupuestos
 * (CreatePresupuestoDto, UpdatePresupuestoDto, ChangeEstadoPresupuestoDto,
 * modelo Presupuesto en schema.prisma)
 */

export const ESTADOS_PRESUPUESTO = ['PENDIENTE', 'APROBADO', 'RECHAZADO'] as const;
export type EstadoPresupuesto = (typeof ESTADOS_PRESUPUESTO)[number];

export interface PresupuestoTecnicoRef {
  id: number;
  nombre: string;
  apellido?: string | null;
}

export interface PresupuestoOrdenRef {
  id: number;
  codigoOrden: string;
}

export interface Presupuesto {
  id: number;
  ordenId: number;
  tecnicoId: number;
  descripcion?: string | null;
  costoRepuestos: string | number;
  costoManoObra: string | number;
  totalEstimado: string | number;
  estado: EstadoPresupuesto | string;
  fecha: string;
  tecnico?: PresupuestoTecnicoRef;
  orden?: PresupuestoOrdenRef;
}

export interface CreatePresupuestoPayload {
  ordenId: number;
  tecnicoId?: number;
  descripcion?: string;
  costoRepuestos?: number;
  costoManoObra?: number;
}

export interface UpdatePresupuestoPayload {
  tecnicoId?: number;
  descripcion?: string;
  costoRepuestos?: number;
  costoManoObra?: number;
}

export interface ChangeEstadoPresupuestoPayload {
  estado: EstadoPresupuesto;
}

export interface PresupuestosQuery {
  page?: number;
  limit?: number;
  ordenId?: number;
  estado?: string;
}
