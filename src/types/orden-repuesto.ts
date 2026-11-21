/**
 * Espejo de backend-nest/src/modules/orden-repuestos
 * Cargar un repuesto descuenta stock (movimiento SALIDA); quitarlo lo
 * devuelve (ENTRADA de reversión). Ambos recalculan el total de la orden.
 */

export interface OrdenRepuesto {
  id: number;
  ordenId: number;
  productoId: number;
  producto: { id: number; codigo?: string | null; nombre: string };
  orden: { id: number; codigoOrden: string };
  cantidad: number;
  precioUnitario: string | number;
  subtotal: string | number;
  fecha: string;
}

export interface CreateOrdenRepuestoPayload {
  ordenId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface OrdenRepuestosQuery {
  page?: number;
  limit?: number;
  ordenId?: number;
}
