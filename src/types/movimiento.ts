/**
 * Espejo de backend-nest/src/modules/inventario/movimientos
 * (ruta real: /movimientos-inventario)
 */

export const TIPOS_MOVIMIENTO = ['ENTRADA', 'SALIDA', 'AJUSTE'] as const;
export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number];

export interface MovimientoProductoRef {
  id: number;
  codigo?: string | null;
  nombre: string;
}

export interface MovimientoUsuarioRef {
  id: number;
  nombre: string;
  apellido?: string | null;
}

export interface MovimientoInventario {
  id: number;
  productoId: number;
  producto: MovimientoProductoRef;
  usuarioId?: number | null;
  usuario?: MovimientoUsuarioRef | null;
  tipoMovimiento: TipoMovimiento | string;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  referenciaTipo?: string | null;
  referenciaId?: number | null;
  motivo?: string | null;
  fecha: string;
}

export interface CreateMovimientoPayload {
  productoId: number;
  tipoMovimiento: TipoMovimiento;
  /** ENTRADA/SALIDA: cantidad a sumar/restar (> 0). AJUSTE: nuevo stock exacto (puede ser 0). */
  cantidad: number;
  motivo?: string;
}

export interface MovimientosQuery {
  page?: number;
  limit?: number;
  productoId?: number;
}
