import { api } from './client';
import type { PaginatedResult } from '../../types/api';
import type {
  ChangeEstadoGarantiaPayload,
  CreateGarantiaPayload,
  Garantia,
  GarantiasQuery,
} from '../../types/garantia';

function toQueryString(query: GarantiasQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const garantiasApi = {
  findAll: (query: GarantiasQuery = {}) =>
    api.get<PaginatedResult<Garantia>>(`/garantias${toQueryString(query)}`),

  findOne: (id: number) => api.get<Garantia>(`/garantias/${id}`),

  create: (payload: CreateGarantiaPayload) => api.post<Garantia>('/garantias', payload),

  changeEstado: (id: number, payload: ChangeEstadoGarantiaPayload) =>
    api.patch<Garantia>(`/garantias/${id}/estado`, payload),
};
