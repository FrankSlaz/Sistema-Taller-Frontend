import { api } from './client';
import type { Categoria, CategoriaPayload } from '../../types/categoria';
import type { FiltroActivo } from '../../components/react/ui/Activacion';

export const categoriasApi = {
  /** Por defecto solo activas; el gestor pide 'todos'. */
  findAll: (estado?: FiltroActivo) =>
    api.get<Categoria[]>(`/categorias-producto${estado ? `?estado=${estado}` : ''}`),

  create: (payload: CategoriaPayload) => api.post<Categoria>('/categorias-producto', payload),

  update: (id: number, payload: Partial<CategoriaPayload>) =>
    api.patch<Categoria>(`/categorias-producto/${id}`, payload),

  /** Activar / desactivar (reemplaza al borrado). */
  cambiarActivo: (id: number, activo: boolean) =>
    api.patch<Categoria>(`/categorias-producto/${id}/activo`, { activo }),
};
