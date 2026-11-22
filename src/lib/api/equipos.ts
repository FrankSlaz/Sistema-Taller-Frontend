import { api } from './client';
import type { PaginatedResult } from '../../types/api';
import type { Equipo, EquipoPayload, EquiposQuery } from '../../types/equipo';

function toQueryString(query: EquiposQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.clienteId) params.set('clienteId', String(query.clienteId));
  if (query.estado) params.set('estado', query.estado);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const equiposApi = {
  findAll: (query: EquiposQuery = {}) =>
    api.get<PaginatedResult<Equipo>>(`/equipos${toQueryString(query)}`),

  findOne: (id: number) => api.get<Equipo>(`/equipos/${id}`),

  create: (payload: EquipoPayload) => api.post<Equipo>('/equipos', payload),

  update: (id: number, payload: Partial<EquipoPayload>) =>
    api.patch<Equipo>(`/equipos/${id}`, payload),

  /** Activar / desactivar (reemplaza al borrado). */
  cambiarActivo: (id: number, activo: boolean) =>
    api.patch<Equipo>(`/equipos/${id}/activo`, { activo }),
};
