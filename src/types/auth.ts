/**
 * Espejo de los modelos Rol / Usuario definidos en
 * backend-nest/prisma/schema.prisma
 */

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export interface Usuario {
  id: number;
  rolId: number;
  rol: Rol;
  nombre: string;
  apellido?: string | null;
  email: string;
  telefono?: string | null;
  estado: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse extends AuthTokens {
  usuario: Usuario;
}

/**
 * Roles de negocio conocidos (sembrados via prisma/seed.ts).
 * Se usan como referencia en el cliente; la fuente de verdad
 * sigue siendo la tabla `roles` en base de datos.
 */
export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  RECEPCION: 'Recepcion',
  TECNICO: 'Tecnico',
  ALMACEN: 'Almacen',
} as const;

export type RolNombre = (typeof ROLES)[keyof typeof ROLES];
