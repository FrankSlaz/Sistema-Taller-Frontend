/**
 * Espejo de backend-nest/src/modules/clientes
 * (CreateClienteDto, UpdateClienteDto, modelo Cliente en schema.prisma)
 */

export interface Cliente {
  id: number;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  estado: boolean | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    equipos: number;
    ordenesReparacion: number;
  };
}

export interface ClientePayload {
  tipoDocumento?: string;
  numeroDocumento?: string;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  estado?: boolean;
}

export interface ClientesQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const TIPOS_DOCUMENTO = ['CI', 'NIT', 'Pasaporte', 'Otro'] as const;
