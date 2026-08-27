/**
 * Espejo de backend-nest/src/modules/usuarios
 * (Usuario y Rol ya están tipados en types/auth.ts)
 */

export interface CreateUsuarioPayload {
  rolId: number;
  nombre: string;
  apellido?: string;
  email: string;
  password: string;
  telefono?: string;
  estado?: boolean;
}

/**
 * UpdateUsuarioDto = PartialType(OmitType(CreateUsuarioDto, ['password'])).
 * La contraseña de otro usuario NO se puede cambiar desde este endpoint;
 * solo existe /usuarios/me/password (autoservicio, requiere la actual).
 */
export type UpdateUsuarioPayload = Partial<Omit<CreateUsuarioPayload, 'password'>>;
