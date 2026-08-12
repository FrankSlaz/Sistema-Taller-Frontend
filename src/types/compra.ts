/**
 * Espejo de backend-nest/src/modules/compras
 * Las compras son inmutables: solo existen GET y POST (sin PATCH/DELETE).
 * Cada línea genera automáticamente un movimiento de inventario ENTRADA.
 */

export interface CompraProveedorRef {
  id: number;
  nombre: string;
}

export interface CompraUsuarioRef {
  id: number;
  nombre: string;
  apellido?: string | null;
}

export interface CompraProductoRef {
  id: number;
  codigo?: string | null;
  nombre: string;
}

export interface DetalleCompra {
  id: number;
  compraId: number;
  productoId: number;
  producto: CompraProductoRef;
  cantidad: number;
  precioUnitario: string | number;
  subtotal: string | number;
}

export interface Compra {
  id: number;
  proveedorId?: number | null;
  proveedor?: CompraProveedorRef | null;
  usuarioId?: number | null;
  usuario?: CompraUsuarioRef | null;
  numeroCompra?: string | null;
  fecha: string;
  total: string | number;
  observaciones?: string | null;
  detalles: DetalleCompra[];
}

export interface CreateDetalleCompraPayload {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface CreateCompraPayload {
  proveedorId?: number;
  numeroCompra?: string;
  observaciones?: string;
  detalles: CreateDetalleCompraPayload[];
}

export interface ComprasQuery {
  page?: number;
  limit?: number;
  proveedorId?: number;
}
