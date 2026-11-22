/**
 * Espejo de backend-nest/src/modules/auditoria y common/auditoria.
 * Cada evento es una operación de un usuario (una petición) con todos los
 * registros que tocó y, por registro, los campos antes -> después.
 */
import type { PaginatedResult } from './api';
import type { RangoFechas } from './reporte';

export type AccionAuditoria =
  | 'CREAR'
  | 'EDITAR'
  | 'ELIMINAR'
  | 'CAMBIAR_ESTADO'
  | 'ANULAR'
  | 'LOGIN'
  | 'LOGIN_FALLIDO'
  | 'RESTAURAR'
  | 'DESCARGAR'
  | string;

export interface CampoCambiado {
  campo: string;
  antes: unknown;
  despues: unknown;
  antesTexto?: string;
  despuesTexto?: string;
}

export interface CambioAuditado {
  entidad: string;
  operacion: 'CREAR' | 'EDITAR' | 'ELIMINAR';
  registroId: number | null;
  etiqueta?: string;
  ordenId?: number | null;
  campos?: CampoCambiado[];
  datos?: Record<string, unknown>;
  textos?: Record<string, string>;
}

export interface EventoAuditoria {
  id: number;
  fecha: string;
  accion: AccionAuditoria;
  modulo: string | null;
  metodo: string | null;
  ruta: string | null;
  tablaAfectada: string | null;
  registroId: number | null;
  ordenId: number | null;
  descripcion: string | null;
  cambios: CambioAuditado[] | null;
  ip: string | null;
  userAgent: string | null;
  usuario: {
    id: number;
    nombre: string;
    apellido?: string | null;
    email: string;
    rol?: { nombre: string };
  } | null;
}

export interface ResumenAuditoria {
  total: number;
  usuarios: number;
  eliminaciones: number;
  accesosFallidos: number;
  porAccion: { accion: string; cantidad: number }[];
}

export type AuditoriaResult = PaginatedResult<EventoAuditoria> & { resumen: ResumenAuditoria };

export interface AuditoriaQuery extends RangoFechas {
  page?: number;
  limit?: number;
  usuarioId?: number;
  modulo?: string;
  accion?: string;
  ordenId?: number;
  search?: string;
}

export interface OpcionesAuditoria {
  modulos: string[];
  acciones: string[];
  usuarios: { id: number; nombre: string; apellido?: string | null }[];
}
