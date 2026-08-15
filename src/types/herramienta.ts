/**
 * Espejo de backend-nest/src/modules/herramientas
 * No hay DELETE: una herramienta se retira poniendo estado = 'BAJA'.
 */

export const ESTADOS_HERRAMIENTA_MANUALES = ['DISPONIBLE', 'MANTENIMIENTO', 'BAJA'] as const;
export type EstadoHerramientaManual = (typeof ESTADOS_HERRAMIENTA_MANUALES)[number];

/** Incluye 'ASIGNADA', que el backend gestiona automáticamente (no es seteable a mano). */
export const ESTADOS_HERRAMIENTA = [...ESTADOS_HERRAMIENTA_MANUALES, 'ASIGNADA'] as const;

export interface AsignacionUsuarioRef {
  id: number;
  nombre: string;
  apellido?: string | null;
}

export interface AsignacionHerramientaRef {
  id: number;
  nombre: string;
  marca?: string | null;
  modelo?: string | null;
}

export interface HerramientaAsignada {
  id: number;
  herramientaId: number;
  herramienta?: AsignacionHerramientaRef;
  usuarioId: number;
  usuario: AsignacionUsuarioRef;
  estado: 'ACTIVA' | 'DEVUELTA' | string;
  fechaEntrega: string;
  fechaDevolucion?: string | null;
  observaciones?: string | null;
}

export interface Herramienta {
  id: number;
  nombre: string;
  marca?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  fechaCompra?: string | null;
  costo?: string | number | null;
  estado: string;
  observaciones?: string | null;
  createdAt: string;
  /** Presente solo en el detalle (findOne): últimas 10 asignaciones. */
  asignaciones?: HerramientaAsignada[];
}

export interface CreateHerramientaPayload {
  nombre: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  fechaCompra?: string;
  costo?: number;
  observaciones?: string;
}

export type UpdateHerramientaPayload = Partial<CreateHerramientaPayload>;

export interface ChangeEstadoHerramientaPayload {
  estado: EstadoHerramientaManual;
}

export interface AsignarHerramientaPayload {
  usuarioId: number;
  observaciones?: string;
}

export interface HerramientasQuery {
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
}

export interface AsignacionesQuery {
  page?: number;
  limit?: number;
  herramientaId?: number;
  usuarioId?: number;
  activas?: boolean;
}
