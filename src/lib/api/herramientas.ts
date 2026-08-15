import { api } from './client';
import type { PaginatedResult } from '../../types/api';
import type {
  AsignacionesQuery,
  AsignarHerramientaPayload,
  ChangeEstadoHerramientaPayload,
  CreateHerramientaPayload,
  Herramienta,
  HerramientaAsignada,
  HerramientasQuery,
  UpdateHerramientaPayload,
} from '../../types/herramienta';

function toQueryString(query: HerramientasQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.estado) params.set('estado', query.estado);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function toAsignacionesQueryString(query: AsignacionesQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.herramientaId) params.set('herramientaId', String(query.herramientaId));
  if (query.usuarioId) params.set('usuarioId', String(query.usuarioId));
  if (query.activas) params.set('activas', 'true');
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const herramientasApi = {
  findAll: (query: HerramientasQuery = {}) =>
    api.get<PaginatedResult<Herramienta>>(`/herramientas${toQueryString(query)}`),

  findOne: (id: number) => api.get<Herramienta>(`/herramientas/${id}`),

  create: (payload: CreateHerramientaPayload) => api.post<Herramienta>('/herramientas', payload),

  update: (id: number, payload: UpdateHerramientaPayload) =>
    api.patch<Herramienta>(`/herramientas/${id}`, payload),

  changeEstado: (id: number, payload: ChangeEstadoHerramientaPayload) =>
    api.patch<Herramienta>(`/herramientas/${id}/estado`, payload),

  asignar: (id: number, payload: AsignarHerramientaPayload) =>
    api.post<HerramientaAsignada>(`/herramientas/${id}/asignar`, payload),

  devolver: (asignacionId: number) =>
    api.patch<HerramientaAsignada>(`/herramientas/asignaciones/${asignacionId}/devolver`),

  findAsignaciones: (query: AsignacionesQuery = {}) =>
    api.get<PaginatedResult<HerramientaAsignada>>(`/herramientas/asignaciones${toAsignacionesQueryString(query)}`),
};
