import type { FiltroActivo } from '../components/react/ui/Activacion';
/**
 * Espejo de backend-nest/src/modules/equipos
 * (CreateEquipoDto, UpdateEquipoDto, modelo Equipo en schema.prisma)
 */

export interface EquipoClienteRef {
  id: number;
  nombre: string;
  telefono?: string | null;
}

export interface Equipo {
  id: number;
  clienteId: number;
  cliente?: EquipoClienteRef;
  tipoEquipo: string;
  marca?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  imei?: string | null;
  color?: string | null;
  estadoFisico?: string | null;
  /** Activo / inactivo (un equipo no se elimina, se desactiva). */
  estado?: boolean | null;
  accesoriosRecibidos?: string | null;
  observaciones?: string | null;
  createdAt: string;
  updatedAt: string;
  /** Id de la primera foto subida al equipo (la usa el listado como miniatura). */
  fotoPrincipalId?: number | null;
  _count?: {
    ordenesReparacion?: number;
    archivos?: number;
  };
}

export interface EquipoPayload {
  clienteId: number;
  tipoEquipo: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  imei?: string;
  color?: string;
  estadoFisico?: string;
  accesoriosRecibidos?: string;
  observaciones?: string;
}

export interface EquiposQuery {
  page?: number;
  limit?: number;
  search?: string;
  clienteId?: number;
  estado?: FiltroActivo;
}

export const TIPOS_EQUIPO = [
  'Celular',
  'Laptop',
  'Computadora de escritorio',
  'Tablet',
  'Impresora',
  'Consola',
  'Otro',
] as const;
