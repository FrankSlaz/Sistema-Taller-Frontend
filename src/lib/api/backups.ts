import { api, downloadFile } from './client';
import type { Backup, RestaurarResultado } from '../../types/backup';

const ruta = (nombre: string) => `/backups/${encodeURIComponent(nombre)}`;

export const backupsApi = {
  listar: () => api.get<Backup[]>('/backups'),

  crear: () => api.post<Backup>('/backups'),

  subir: (file: File) => {
    const form = new FormData();
    form.append('archivo', file);
    return api.post<Backup>('/backups/subir', form);
  },

  descargar: (nombre: string) => downloadFile(`${ruta(nombre)}/descargar`, nombre),

  restaurar: (nombre: string, confirmacion: string) =>
    api.post<RestaurarResultado>(`${ruta(nombre)}/restaurar`, { confirmacion }),

  eliminar: (nombre: string) => api.delete<{ message: string }>(ruta(nombre)),
};
