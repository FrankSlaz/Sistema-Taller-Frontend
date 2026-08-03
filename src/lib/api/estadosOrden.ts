import { api } from './client';
import type { EstadoOrden } from '../../types/estado-orden';

export const estadosOrdenApi = {
  findAll: () => api.get<EstadoOrden[]>('/estados-orden'),
};
