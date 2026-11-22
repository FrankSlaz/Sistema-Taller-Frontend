/**
 * Espejo de backend-nest/src/modules/configuracion
 * Fila única (singleton, id=1). GET es libre para cualquier usuario
 * autenticado; PATCH requiere rol Administrador (@Roles clásico, no
 * el sistema de permisos dinámicos — igual que Usuarios/Roles/Reportes).
 */

export interface Configuracion {
  id: number;
  nombreTaller?: string | null;
  logo?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  moneda?: string | null;
  simbolo?: string | null;
  /** Días de garantía que se dan al entregar (0 = sin garantía automática). */
  garantiaDiasDefault?: number;
  /** Condiciones de garantía por defecto (se imprimen en el acta de entrega). */
  garantiaCondiciones?: string | null;
  updatedAt?: string | null;
  /** Solo lectura: hay correo para "Olvidé mi contraseña" (variables MAIL_* del backend). */
  correoRecuperacion?: boolean;
}

/** El logo no va en el PATCH: se sube como archivo (POST /configuracion/logo). */
export type UpdateConfiguracionPayload = Partial<Omit<Configuracion, 'id' | 'updatedAt' | 'logo' | 'correoRecuperacion'>>;

/** GET /configuracion/publica (sin sesión). */
export interface ConfiguracionPublica {
  nombreTaller: string;
  tieneLogo: boolean;
  logoVersion: string | null;
}
