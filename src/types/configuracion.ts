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
  mensajeDocumentos?: string | null;
  updatedAt?: string | null;
}

export type UpdateConfiguracionPayload = Partial<Omit<Configuracion, 'id' | 'updatedAt'>>;
