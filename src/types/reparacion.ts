import type { EstadoOrden } from './estado-orden';

/**
 * Espejo de backend-nest/src/modules/reparaciones
 * (CreateOrdenDto, UpdateOrdenDto, ChangeEstadoDto, AssignTecnicoDto,
 * modelo OrdenReparacion en schema.prisma)
 */

export const PRIORIDADES = ['BAJA', 'NORMAL', 'ALTA', 'URGENTE'] as const;
export type Prioridad = (typeof PRIORIDADES)[number];

export const TIPOS_PARTICIPACION = ['PRINCIPAL', 'APOYO'] as const;

export interface OrdenClienteRef {
  id: number;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
}

export interface OrdenEquipoRef {
  id: number;
  tipoEquipo: string;
  marca?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
}

export interface OrdenTecnico {
  id: number;
  ordenId: number;
  usuarioId: number;
  tipoParticipacion?: string | null;
  fechaAsignacion?: string | null;
  usuario: { id: number; nombre: string; apellido?: string | null };
}

export interface HistorialOrdenItem {
  id: number;
  ordenId: number;
  usuarioId?: number | null;
  estadoAnterior?: string | null;
  estadoNuevo?: string | null;
  comentario?: string | null;
  fecha: string;
  usuario?: { id: number; nombre: string; apellido?: string | null } | null;
}

export interface Diagnostico {
  id: number;
  ordenId: number;
  tecnicoId?: number | null;
  fallaDetectada?: string | null;
  diagnostico?: string | null;
  solucionPropuesta?: string | null;
  observaciones?: string | null;
  fecha: string;
}

export interface Presupuesto {
  id: number;
  ordenId: number;
  tecnicoId?: number | null;
  descripcion?: string | null;
  costoRepuestos?: string | number | null;
  costoManoObra?: string | number | null;
  totalEstimado?: string | number | null;
  estado?: string | null;
  fecha: string;
}

export interface OrdenReparacion {
  id: number;
  codigoOrden: string;
  clienteId: number;
  equipoId: number;
  estadoId: number;
  prioridad?: Prioridad | string | null;
  fechaIngreso?: string | null;
  fechaEstimadaEntrega?: string | null;
  fechaPromesa?: string | null;
  fechaEntrega?: string | null;
  fallaReportada?: string | null;
  observaciones?: string | null;
  costoManoObra?: string | number | null;
  totalRepuestos?: string | number | null;
  total?: string | number | null;
  createdAt: string;
  updatedAt: string;

  cliente: OrdenClienteRef;
  equipo: OrdenEquipoRef;
  estado: EstadoOrden;
  ordenTecnicos: OrdenTecnico[];

  // Presentes solo en el detalle (findOne)
  diagnosticos?: Diagnostico[];
  presupuestos?: Presupuesto[];
  historialOrden?: HistorialOrdenItem[];
}

export interface CreateOrdenPayload {
  clienteId: number;
  equipoId: number;
  prioridad?: Prioridad;
  fechaEstimadaEntrega?: string;
  fechaPromesa?: string;
  fallaReportada: string;
  observaciones?: string;
}

export interface UpdateOrdenPayload {
  prioridad?: Prioridad;
  fechaEstimadaEntrega?: string;
  fechaPromesa?: string;
  fallaReportada?: string;
  observaciones?: string;
  costoManoObra?: number;
  totalRepuestos?: number;
}

export interface ChangeEstadoPayload {
  estadoId: number;
  comentario?: string;
}

export interface AssignTecnicoPayload {
  usuarioId: number;
  tipoParticipacion?: (typeof TIPOS_PARTICIPACION)[number];
}

export interface OrdenesQuery {
  page?: number;
  limit?: number;
  search?: string;
  clienteId?: number;
  equipoId?: number;
  estadoId?: number;
  prioridad?: string;
}
