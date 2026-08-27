import { api } from './client';
import type { PaginatedResult } from '../../types/api';
import type {
  AssignTecnicoPayload,
  ChangeEstadoPayload,
  CreateOrdenPayload,
  OrdenReparacion,
  OrdenTecnico,
  OrdenesQuery,
  Tecnico,
  UpdateOrdenPayload,
} from '../../types/reparacion';

function toQueryString(query: OrdenesQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.clienteId) params.set('clienteId', String(query.clienteId));
  if (query.equipoId) params.set('equipoId', String(query.equipoId));
  if (query.estadoId) params.set('estadoId', String(query.estadoId));
  if (query.prioridad) params.set('prioridad', query.prioridad);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const reparacionesApi = {
  findAll: (query: OrdenesQuery = {}) =>
    api.get<PaginatedResult<OrdenReparacion>>(`/reparaciones${toQueryString(query)}`),

  findOne: (id: number) => api.get<OrdenReparacion>(`/reparaciones/${id}`),

  create: (payload: CreateOrdenPayload) => api.post<OrdenReparacion>('/reparaciones', payload),

  update: (id: number, payload: UpdateOrdenPayload) =>
    api.patch<OrdenReparacion>(`/reparaciones/${id}`, payload),

  changeEstado: (id: number, payload: ChangeEstadoPayload) =>
    api.patch<OrdenReparacion>(`/reparaciones/${id}/estado`, payload),

  assignTecnico: (id: number, payload: AssignTecnicoPayload) =>
    api.post<OrdenTecnico>(`/reparaciones/${id}/tecnicos`, payload),

  removeTecnico: (id: number, usuarioId: number) =>
    api.delete<{ message: string }>(`/reparaciones/${id}/tecnicos/${usuarioId}`),

  remove: (id: number) => api.delete<{ message: string }>(`/reparaciones/${id}`),

  /**
   * GET /reparaciones/tecnicos — endpoint acotado que reemplaza la
   * dependencia anterior de GET /usuarios (restringido a rol
   * Administrador). Requiere solo 'reparaciones:editar', y devuelve
   * únicamente usuarios activos con rol Tecnico (sin el objeto `rol`,
   * ya viene pre-filtrado por el backend).
   */
  findTecnicos: () => api.get<Tecnico[]>('/reparaciones/tecnicos'),
};
