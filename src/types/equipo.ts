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
  accesoriosRecibidos?: string | null;
  observaciones?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    ordenesReparacion: number;
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
