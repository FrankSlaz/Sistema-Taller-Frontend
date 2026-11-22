import { api } from './client';
import type { Proveedor, ProveedorPayload } from '../../types/proveedor';
import type { FiltroActivo } from '../../components/react/ui/Activacion';

export const proveedoresApi = {
  /** Por defecto solo activos; el gestor pide 'todos'. */
  findAll: (estado?: FiltroActivo) => api.get<Proveedor[]>(`/proveedores${estado ? `?estado=${estado}` : ''}`),

  create: (payload: ProveedorPayload) => api.post<Proveedor>('/proveedores', payload),

  update: (id: number, payload: Partial<ProveedorPayload>) =>
    api.patch<Proveedor>(`/proveedores/${id}`, payload),

  /** Activar / desactivar (reemplaza al borrado). */
  cambiarActivo: (id: number, activo: boolean) =>
    api.patch<Proveedor>(`/proveedores/${id}/activo`, { activo }),
};
