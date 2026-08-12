import { api } from './client';
import type { Proveedor, ProveedorPayload } from '../../types/proveedor';

export const proveedoresApi = {
  findAll: () => api.get<Proveedor[]>('/proveedores'),

  create: (payload: ProveedorPayload) => api.post<Proveedor>('/proveedores', payload),

  update: (id: number, payload: Partial<ProveedorPayload>) =>
    api.patch<Proveedor>(`/proveedores/${id}`, payload),

  remove: (id: number) => api.delete<{ message: string }>(`/proveedores/${id}`),
};
