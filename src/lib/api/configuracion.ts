import { api } from './client';
import type { Configuracion, ConfiguracionPublica, UpdateConfiguracionPayload } from '../../types/configuracion';

export const configuracionApi = {
  get: () => api.get<Configuracion>('/configuracion'),

  /** Ruta pública: nombre del taller y si tiene logo (con su versión para la caché). */
  publica: () => api.get<ConfiguracionPublica>('/configuracion/publica', { auth: false }),

  update: (payload: UpdateConfiguracionPayload) => api.patch<Configuracion>('/configuracion', payload),

  subirLogo: (file: File) => {
    const form = new FormData();
    form.append('logo', file);
    return api.post<Configuracion>('/configuracion/logo', form);
  },

  eliminarLogo: () => api.delete<Configuracion>('/configuracion/logo'),
};
