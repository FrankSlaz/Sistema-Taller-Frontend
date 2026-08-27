import { api } from './client';
import type { ChangePasswordPayload, ResetPasswordPayload, Usuario } from '../../types/auth';
import type { CreateUsuarioPayload, UpdateUsuarioPayload } from '../../types/usuario';

/**
 * GET /usuarios está restringido a rol "Administrador" en el backend
 * (@Roles('Administrador') en UsuariosController). El selector de
 * técnicos en Reparaciones depende de este endpoint; si el usuario
 * autenticado no es Administrador, la petición devolverá 403 y el
 * combobox de técnicos debe manejar ese error con gracia.
 *
 * findAll() devuelve un array plano (no paginado): el backend no
 * implementa paginación para este recurso.
 */
export const usuariosApi = {
  findAll: () => api.get<Usuario[]>('/usuarios'),

  findOne: (id: number) => api.get<Usuario>(`/usuarios/${id}`),

  create: (payload: CreateUsuarioPayload) => api.post<Usuario>('/usuarios', payload),

  update: (id: number, payload: UpdateUsuarioPayload) => api.patch<Usuario>(`/usuarios/${id}`, payload),

  /**
   * Baja lógica: además de estado:false, el backend setea deletedAt.
   * findAll/findOne filtran deletedAt:null, así que un usuario
   * eliminado desaparece POR COMPLETO de la API — no existe forma de
   * recuperarlo desde ningún endpoint. Distinto de un PATCH con
   * estado:false (ver update), que sí es reversible.
   */
  remove: (id: number) => api.delete<{ message: string }>(`/usuarios/${id}`),

  /** Autoservicio: cambia MI PROPIA contraseña, exige la actual. Cualquier usuario autenticado. */
  changeOwnPassword: (payload: ChangePasswordPayload) =>
    api.patch<{ message: string }>('/usuarios/me/password', payload),

  /** Solo Administrador: resetea la contraseña de OTRO usuario, sin pedir la actual. */
  resetPassword: (id: number, payload: ResetPasswordPayload) =>
    api.patch<{ message: string }>(`/usuarios/${id}/password`, payload),
};
