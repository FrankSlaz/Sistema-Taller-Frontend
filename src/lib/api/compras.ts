import { api } from './client';
import type { PaginatedResult } from '../../types/api';
import type { Compra, ComprasQuery, CreateCompraPayload } from '../../types/compra';

function toQueryString(query: ComprasQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.proveedorId) params.set('proveedorId', String(query.proveedorId));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const comprasApi = {
  findAll: (query: ComprasQuery = {}) => api.get<PaginatedResult<Compra>>(`/compras${toQueryString(query)}`),

  findOne: (id: number) => api.get<Compra>(`/compras/${id}`),

  create: (payload: CreateCompraPayload) => api.post<Compra>('/compras', payload),
};
