import { api } from './client';
import type { PaginatedResult } from '../../types/api';
import type { CreateMovimientoPayload, MovimientoInventario, MovimientosQuery } from '../../types/movimiento';

function toQueryString(query: MovimientosQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.productoId) params.set('productoId', String(query.productoId));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const movimientosApi = {
  findAll: (query: MovimientosQuery = {}) =>
    api.get<PaginatedResult<MovimientoInventario>>(`/movimientos-inventario${toQueryString(query)}`),

  registrar: (payload: CreateMovimientoPayload) =>
    api.post<MovimientoInventario>('/movimientos-inventario', payload),
};
