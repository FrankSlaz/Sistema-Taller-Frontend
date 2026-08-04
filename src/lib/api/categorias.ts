import { api } from './client';
import type { Categoria, CategoriaPayload } from '../../types/categoria';

export const categoriasApi = {
  findAll: () => api.get<Categoria[]>('/categorias-producto'),

  create: (payload: CategoriaPayload) => api.post<Categoria>('/categorias-producto', payload),

  update: (id: number, payload: Partial<CategoriaPayload>) =>
    api.patch<Categoria>(`/categorias-producto/${id}`, payload),

  remove: (id: number) => api.delete<{ message: string }>(`/categorias-producto/${id}`),
};
