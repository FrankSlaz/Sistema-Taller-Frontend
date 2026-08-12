/**
 * Espejo de backend-nest/src/modules/compras/proveedores
 */

export interface Proveedor {
  id: number;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  estado: boolean | null;
  createdAt: string;
  _count?: { compras: number };
}

export interface ProveedorPayload {
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  estado?: boolean;
}
