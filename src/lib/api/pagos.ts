import { api } from './client';
import type { PaginatedResult } from '../../types/api';
import type { CreatePagoPayload, Pago, PagosQuery, PagosResumen } from '../../types/pago';

/**
 * Cuando se filtra por ordenId, el backend agrega `resumen`
 * (totalOrden/totalPagado/saldoPendiente) además de items/meta.
 */
export type PagosResult = PaginatedResult<Pago> & { resumen?: PagosResumen };

function toQueryString(query: PagosQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.ordenId) params.set('ordenId', String(query.ordenId));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const pagosApi = {
  findAll: (query: PagosQuery = {}) => api.get<PagosResult>(`/pagos${toQueryString(query)}`),

  findOne: (id: number) => api.get<Pago>(`/pagos/${id}`),

  create: (payload: CreatePagoPayload) => api.post<Pago>('/pagos', payload),

  remove: (id: number) => api.delete<{ message: string }>(`/pagos/${id}`),
};
