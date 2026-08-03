import { api } from './client';
import type { Usuario } from '../../types/auth';

/**
 * GET /usuarios está restringido a rol "Administrador" en el backend
 * (@Roles('Administrador') en UsuariosController). El selector de
 * técnicos en Reparaciones depende de este endpoint; si el usuario
 * autenticado no es Administrador, la petición devolverá 403 y el
 * combobox de técnicos debe manejar ese error con gracia.
 */
export const usuariosApi = {
  findAll: () => api.get<Usuario[]>('/usuarios'),
};
