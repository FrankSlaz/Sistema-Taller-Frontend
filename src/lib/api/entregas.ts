import { api } from './client';
import type { PaginatedResult } from '../../types/api';
import type { CreateEntregaPayload, Entrega, EntregasQuery } from '../../types/entrega';

function toQueryString(query: EntregasQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const entregasApi = {
  findAll: (query: EntregasQuery = {}) => api.get<PaginatedResult<Entrega>>(`/entregas${toQueryString(query)}`),

  findOne: (id: number) => api.get<Entrega>(`/entregas/${id}`),

  findByOrden: (ordenId: number) => api.get<Entrega>(`/entregas/orden/${ordenId}`),

  create: (payload: CreateEntregaPayload) => api.post<Entrega>('/entregas', payload),
};
