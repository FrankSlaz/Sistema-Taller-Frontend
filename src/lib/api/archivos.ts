import { api, fetchBlob } from './client';
import type { ArchivoEquipo, UploadArchivosPayload } from '../../types/archivo';

export const archivosApi = {
  /** Sin ordenId devuelve TODAS las fotos del equipo; con ordenId, solo las de esa orden. */
  findAll: (equipoId: number, ordenId?: number) =>
    api.get<ArchivoEquipo[]>(`/equipos/${equipoId}/archivos${ordenId ? `?ordenId=${ordenId}` : ''}`),

  upload: (equipoId: number, { files, ordenId, descripcion }: UploadArchivosPayload) => {
    const form = new FormData();
    files.forEach((file) => form.append('archivos', file)); // el campo se llama "archivos"
    if (ordenId) form.append('ordenId', String(ordenId));
    if (descripcion) form.append('descripcion', descripcion);
    return api.post<ArchivoEquipo[]>(`/equipos/${equipoId}/archivos`, form);
  },

  update: (id: number, descripcion: string) => api.patch<ArchivoEquipo>(`/archivos-equipo/${id}`, { descripcion }),

  remove: (id: number) => api.delete<{ message: string }>(`/archivos-equipo/${id}`),

  /** Blob de la imagen (endpoint autenticado: un <img src> directo no mandaría el token). */
  contenido: (id: number) => fetchBlob(`/archivos-equipo/${id}/contenido`),
};
