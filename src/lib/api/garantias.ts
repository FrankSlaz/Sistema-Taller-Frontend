import { api } from './client';
import type { PaginatedResult } from '../../types/api';
import type {
  ChangeEstadoGarantiaPayload,
  CreateGarantiaPayload,
  Garantia,
  GarantiasQuery,
  GarantiasResumen,
  ReclamoGarantiaPayload,
} from '../../types/garantia';

export type GarantiasResult = PaginatedResult<Garantia> & { resumen: GarantiasResumen };

function toQueryString(query: GarantiasQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.estado) params.set('estado', query.estado);
  if (query.search) params.set('search', query.search);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const garantiasApi = {
  findAll: (query: GarantiasQuery = {}) => api.get<GarantiasResult>(`/garantias${toQueryString(query)}`),

  findOne: (id: number) => api.get<Garantia>(`/garantias/${id}`),

  create: (payload: CreateGarantiaPayload) => api.post<Garantia>('/garantias', payload),

  changeEstado: (id: number, payload: ChangeEstadoGarantiaPayload) =>
    api.patch<Garantia>(`/garantias/${id}/estado`, payload),

  /** Atender por garantía: abre una orden nueva enlazada. */
  reclamar: (id: number, payload: ReclamoGarantiaPayload) =>
    api.post<{ ordenId: number; codigoOrden: string }>(`/garantias/${id}/reclamo`, payload),
};
