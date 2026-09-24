import { api } from './client';
import type { Configuracion, UpdateConfiguracionPayload } from '../../types/configuracion';

export const configuracionApi = {
  get: () => api.get<Configuracion>('/configuracion'),

  update: (payload: UpdateConfiguracionPayload) => api.patch<Configuracion>('/configuracion', payload),
};
