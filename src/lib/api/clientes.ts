import { api } from './client';
import type { PaginatedResult } from '../../types/api';
import type { Cliente, ClientePayload, ClientesQuery } from '../../types/cliente';

function toQueryString(query: ClientesQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const clientesApi = {
  findAll: (query: ClientesQuery = {}) =>
    api.get<PaginatedResult<Cliente>>(`/clientes${toQueryString(query)}`),

  findOne: (id: number) => api.get<Cliente>(`/clientes/${id}`),

  create: (payload: ClientePayload) => api.post<Cliente>('/clientes', payload),

  update: (id: number, payload: Partial<ClientePayload>) =>
    api.patch<Cliente>(`/clientes/${id}`, payload),

  remove: (id: number) => api.delete<{ message: string }>(`/clientes/${id}`),
};
