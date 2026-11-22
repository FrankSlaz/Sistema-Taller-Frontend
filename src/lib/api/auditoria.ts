import { api } from './client';
import type { AuditoriaQuery, AuditoriaResult, EventoAuditoria, OpcionesAuditoria } from '../../types/auditoria';

function toQueryString(query: AuditoriaQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** Solo lectura y solo Administrador (@Roles('Administrador') en el backend). */
export const auditoriaApi = {
  findAll: (query: AuditoriaQuery = {}) => api.get<AuditoriaResult>(`/auditoria${toQueryString(query)}`),
  findOne: (id: number) => api.get<EventoAuditoria>(`/auditoria/${id}`),
  opciones: () => api.get<OpcionesAuditoria>('/auditoria/opciones'),
};
