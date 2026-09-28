import { api } from './client';
import type { PaginatedResult } from '../../types/api';
import type {
  CreateDiagnosticoPayload,
  Diagnostico,
  DiagnosticosQuery,
  UpdateDiagnosticoPayload,
} from '../../types/diagnostico';

function toQueryString(query: DiagnosticosQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.ordenId) params.set('ordenId', String(query.ordenId));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const diagnosticosApi = {
  findAll: (query: DiagnosticosQuery = {}) =>
    api.get<PaginatedResult<Diagnostico>>(`/diagnosticos${toQueryString(query)}`),

  findOne: (id: number) => api.get<Diagnostico>(`/diagnosticos/${id}`),

  create: (payload: CreateDiagnosticoPayload) => api.post<Diagnostico>('/diagnosticos', payload),

  update: (id: number, payload: UpdateDiagnosticoPayload) =>
    api.patch<Diagnostico>(`/diagnosticos/${id}`, payload),

  remove: (id: number) => api.delete<{ message: string }>(`/diagnosticos/${id}`),
};
