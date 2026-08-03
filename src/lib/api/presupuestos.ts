import { api } from './client';
import type { PaginatedResult } from '../../types/api';
import type {
  ChangeEstadoPresupuestoPayload,
  CreatePresupuestoPayload,
  Presupuesto,
  PresupuestosQuery,
  UpdatePresupuestoPayload,
} from '../../types/presupuesto';

function toQueryString(query: PresupuestosQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.ordenId) params.set('ordenId', String(query.ordenId));
  if (query.estado) params.set('estado', query.estado);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const presupuestosApi = {
  findAll: (query: PresupuestosQuery = {}) =>
    api.get<PaginatedResult<Presupuesto>>(`/presupuestos${toQueryString(query)}`),

  findOne: (id: number) => api.get<Presupuesto>(`/presupuestos/${id}`),

  create: (payload: CreatePresupuestoPayload) => api.post<Presupuesto>('/presupuestos', payload),

  update: (id: number, payload: UpdatePresupuestoPayload) =>
    api.patch<Presupuesto>(`/presupuestos/${id}`, payload),

  changeEstado: (id: number, payload: ChangeEstadoPresupuestoPayload) =>
    api.patch<Presupuesto>(`/presupuestos/${id}/estado`, payload),

  remove: (id: number) => api.delete<{ message: string }>(`/presupuestos/${id}`),
};
