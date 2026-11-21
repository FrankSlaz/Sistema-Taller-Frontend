import { api } from './client';
import type { PaginatedResult } from '../../types/api';
import type {
  CreateOrdenRepuestoPayload,
  OrdenRepuesto,
  OrdenRepuestosQuery,
} from '../../types/orden-repuesto';

function toQueryString(query: OrdenRepuestosQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.ordenId) params.set('ordenId', String(query.ordenId));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const ordenRepuestosApi = {
  findAll: (query: OrdenRepuestosQuery = {}) =>
    api.get<PaginatedResult<OrdenRepuesto>>(`/orden-repuestos${toQueryString(query)}`),

  create: (payload: CreateOrdenRepuestoPayload) => api.post<OrdenRepuesto>('/orden-repuestos', payload),

  remove: (id: number) => api.delete<{ message: string }>(`/orden-repuestos/${id}`),
};
