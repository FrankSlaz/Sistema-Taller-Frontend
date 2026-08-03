/**
 * Espejo de backend-nest/src/modules/estados-orden
 * Catálogo fijo, sembrado por docs/sistema_taller.sql (solo lectura).
 */

export interface EstadoOrden {
  id: number;
  nombre: string;
  descripcion?: string | null;
  ordenVisual?: number | null;
}

/**
 * Nombres reales sembrados en la base (ver INSERT INTO estados_orden
 * en docs/sistema_taller.sql). Se usan como referencia para colores/
 * etiquetas; la fuente de verdad sigue siendo GET /estados-orden.
 */
export const ESTADOS_ORDEN_NOMBRES = [
  'RECIBIDO',
  'DIAGNOSTICO',
  'ESPERANDO_APROBACION',
  'EN_REPARACION',
  'PRUEBAS',
  'LISTO_ENTREGA',
  'ENTREGADO',
  'CANCELADO',
  'NO_REPARABLE',
] as const;
