import { api } from './client';
import type { RolConConteo, RolPayload } from '../../types/rol';

/**
 * GET /roles y GET /roles/:id son de lectura libre para cualquier
 * usuario autenticado. Crear/editar/eliminar y gestionar permisos
 * requieren rol Administrador (@Roles('Administrador') hardcodeado
 * en el backend, a propósito — ver PermissionsGuard).
 */
export const rolesApi = {
  findAll: () => api.get<RolConConteo[]>('/roles'),

  findOne: (id: number) => api.get<RolConConteo>(`/roles/${id}`),

  create: (payload: RolPayload) => api.post<RolConConteo>('/roles', payload),

  update: (id: number, payload: Partial<RolPayload>) =>
    api.patch<RolConConteo>(`/roles/${id}`, payload),

  remove: (id: number) => api.delete<{ message: string }>(`/roles/${id}`),

  getPermisos: (id: number) => api.get<number[]>(`/roles/${id}/permisos`),

  setPermisos: (id: number, permisoIds: number[]) =>
    api.put<number[]>(`/roles/${id}/permisos`, { permisoIds }),
};
