import { api, downloadFile } from './client';
import type { PaginatedResult } from '../../types/api';
import type { CreateEntregaPayload, Entrega, EntregaCreada, EntregasQuery } from '../../types/entrega';

function toQueryString(query: EntregasQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const entregasApi = {
  findAll: (query: EntregasQuery = {}) => api.get<PaginatedResult<Entrega>>(`/entregas${toQueryString(query)}`),

  findOne: (id: number) => api.get<Entrega>(`/entregas/${id}`),

  findByOrden: (ordenId: number) => api.get<Entrega>(`/entregas/orden/${ordenId}`),

  create: (payload: CreateEntregaPayload) => api.post<EntregaCreada>('/entregas', payload),

  /** Anular una entrega registrada por error (la orden vuelve a "Listo para entrega"). */
  anular: (id: number, motivo: string) => api.post<{ message: string }>(`/entregas/${id}/anular`, { motivo }),

  acta: (id: number, codigoOrden: string) => downloadFile(`/entregas/${id}/acta`, `acta-entrega-${codigoOrden}.pdf`),
};
