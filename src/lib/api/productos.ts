import { api } from './client';
import type { PaginatedResult } from '../../types/api';
import type { CreateProductoPayload, Producto, ProductosQuery, UpdateProductoPayload } from '../../types/producto';

function toQueryString(query: ProductosQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.categoriaId) params.set('categoriaId', String(query.categoriaId));
  if (query.stockBajo) params.set('stockBajo', 'true');
  if (query.estado) params.set('estado', query.estado);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const productosApi = {
  findAll: (query: ProductosQuery = {}) =>
    api.get<PaginatedResult<Producto>>(`/productos${toQueryString(query)}`),

  findOne: (id: number) => api.get<Producto>(`/productos/${id}`),

  create: (payload: CreateProductoPayload) => api.post<Producto>('/productos', payload),

  update: (id: number, payload: Partial<UpdateProductoPayload>) =>
    api.patch<Producto>(`/productos/${id}`, payload),

  /** Activar / desactivar (reemplaza al borrado). */
  cambiarActivo: (id: number, activo: boolean) =>
    api.patch<Producto>(`/productos/${id}/activo`, { activo }),
};
