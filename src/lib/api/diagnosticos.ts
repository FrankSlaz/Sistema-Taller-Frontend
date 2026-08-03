import { api } from './client';
import type { Diagnostico } from '../../types/reparacion';

export interface CreateDiagnosticoPayload {
  ordenId: number;
  tecnicoId?: number;
  fallaDetectada?: string;
  diagnostico?: string;
  solucionPropuesta?: string;
  observaciones?: string;
}

export const diagnosticosApi = {
  create: (payload: CreateDiagnosticoPayload) => api.post<Diagnostico>('/diagnosticos', payload),

  remove: (id: number) => api.delete<{ message: string }>(`/diagnosticos/${id}`),
};
