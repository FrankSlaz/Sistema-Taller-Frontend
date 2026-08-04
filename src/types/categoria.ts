/**
 * Espejo de backend-nest/src/modules/inventario/categorias
 * (ruta real: /categorias-producto)
 */

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado: boolean | null;
  createdAt: string;
  _count?: { productos: number };
}

export interface CategoriaPayload {
  nombre: string;
  descripcion?: string;
  estado?: boolean;
}
