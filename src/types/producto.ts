/**
 * Espejo de backend-nest/src/modules/inventario/productos
 * (CreateProductoDto, UpdateProductoDto, modelo Producto en schema.prisma)
 */

export interface ProductoCategoriaRef {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  categoriaId: number;
  categoria: ProductoCategoriaRef;
  codigo?: string | null;
  nombre: string;
  descripcion?: string | null;
  marca?: string | null;
  modeloCompatible?: string | null;
  precioCompra?: string | number | null;
  precioReferencia?: string | number | null;
  stockActual: number;
  stockMinimo: number;
  imagen?: string | null;
  estado: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductoPayload {
  categoriaId: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  marca?: string;
  modeloCompatible?: string;
  precioCompra?: number;
  precioReferencia?: number;
  /** Solo en creación: genera un movimiento ENTRADA de stock inicial. */
  stockActual?: number;
  stockMinimo?: number;
  estado?: boolean;
}

/**
 * El backend excluye explícitamente stockActual de UpdateProductoDto:
 * los cambios de stock SIEMPRE pasan por /movimientos-inventario.
 */
export type UpdateProductoPayload = Omit<CreateProductoPayload, 'stockActual'>;

export interface ProductosQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoriaId?: number;
  stockBajo?: boolean;
}
