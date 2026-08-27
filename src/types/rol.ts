/**
 * Espejo de backend-nest/src/modules/roles
 * (Rol base ya está tipado en types/auth.ts; acá solo los payloads
 * y la variante con _count que devuelve findAll/findOne).
 */

import type { Rol } from './auth';

export interface RolConConteo extends Rol {
  _count?: { usuarios: number };
}

export interface RolPayload {
  nombre: string;
  descripcion?: string;
}
