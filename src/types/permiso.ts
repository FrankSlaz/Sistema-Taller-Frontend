/**
 * Espejo de backend-nest/src/modules/permisos
 * Catálogo fijo (56 registros: 14 recursos × 4 acciones), sembrado por
 * prisma/seed.ts. Solo lectura desde el frontend — el catálogo en sí no
 * se edita, lo que se edita es qué permisos tiene cada Rol.
 */

export interface Permiso {
  id: number;
  recurso: string;
  accion: 'ver' | 'crear' | 'editar' | 'eliminar' | string;
  descripcion?: string | null;
}

/**
 * Recursos reales usados por @RequirePermission en el backend (ver
 * auditoría de controllers). "inventario" cubre productos+categorías+
 * movimientos; "compras" cubre también proveedores.
 */
export const RECURSOS_PERMISO = [
  'clientes',
  'equipos',
  'reparaciones',
  'diagnosticos',
  'presupuestos',
  'inventario',
  'compras',
  'entregas',
  'garantias',
  'herramientas',
  'usuarios',
  'roles',
  'configuracion',
  'reportes',
] as const;

export const ACCIONES_PERMISO = ['ver', 'crear', 'editar', 'eliminar'] as const;

const RECURSO_LABELS: Record<string, string> = {
  clientes: 'Clientes',
  equipos: 'Equipos',
  reparaciones: 'Reparaciones',
  diagnosticos: 'Diagnósticos',
  presupuestos: 'Presupuestos',
  inventario: 'Inventario',
  compras: 'Compras',
  entregas: 'Entregas',
  garantias: 'Garantías',
  herramientas: 'Herramientas',
  usuarios: 'Usuarios',
  roles: 'Roles',
  configuracion: 'Configuración',
  reportes: 'Reportes',
};

export function recursoLabel(recurso: string): string {
  return RECURSO_LABELS[recurso] ?? recurso;
}

const ACCION_LABELS: Record<string, string> = {
  ver: 'Ver',
  crear: 'Crear',
  editar: 'Editar',
  eliminar: 'Eliminar',
};

export function accionLabel(accion: string): string {
  return ACCION_LABELS[accion] ?? accion;
}
