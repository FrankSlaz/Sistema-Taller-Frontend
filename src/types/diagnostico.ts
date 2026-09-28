/**
 * Espejo de backend-nest/src/modules/diagnosticos
 * CRUD completo (antes el frontend solo usaba create, embebido en la
 * orden). tecnicoId se auto-asigna al usuario autenticado si se omite.
 */

export interface DiagnosticoTecnicoRef {
  id: number;
  nombre: string;
  apellido?: string | null;
}

export interface DiagnosticoOrdenRef {
  id: number;
  codigoOrden: string;
}

export interface Diagnostico {
  id: number;
  ordenId: number;
  orden?: DiagnosticoOrdenRef;
  tecnicoId?: number | null;
  tecnico?: DiagnosticoTecnicoRef | null;
  fallaDetectada?: string | null;
  diagnostico?: string | null;
  solucionPropuesta?: string | null;
  observaciones?: string | null;
  fecha: string;
}

export interface CreateDiagnosticoPayload {
  ordenId: number;
  tecnicoId?: number;
  fallaDetectada?: string;
  diagnostico?: string;
  solucionPropuesta?: string;
  observaciones?: string;
}

export type UpdateDiagnosticoPayload = Partial<Omit<CreateDiagnosticoPayload, 'ordenId'>>;

export interface DiagnosticosQuery {
  page?: number;
  limit?: number;
  ordenId?: number;
}
