import { api } from './client';
import type { Permiso } from '../../types/permiso';

export const permisosApi = {
  findAll: () => api.get<Permiso[]>('/permisos'),
};
