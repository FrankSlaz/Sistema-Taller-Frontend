/**
 * Espejo de backend-nest/src/modules/reportes
 * Los 7 reportes, todos protegidos con @Roles('Administrador') clásico
 * (no el sistema de permisos dinámicos). Cada uno tiene un endpoint JSON
 * y un endpoint /pdf hermano que devuelve el mismo contenido como PDF
 * descargable (StreamableFile).
 */

// 1) Reparaciones por estado (mensual)
export interface ReparacionesPorEstadoQuery {
  mes?: number; // 1-12
  anio?: number;
}
export interface ReparacionesPorEstadoRow {
  estado: string;
  cantidad: number;
}
export interface ReparacionesPorEstado {
  periodo: string;
  totalOrdenes: number;
  detalle: ReparacionesPorEstadoRow[];
}

// 2) Ingresos por rango de fechas
export interface IngresosQuery {
  fechaInicio: string; // requerido, YYYY-MM-DD
  fechaFin: string;
}
export interface IngresosPorMetodoRow {
  metodoPago: string;
  cantidadPagos: number;
  totalMonto: number;
}
export interface Ingresos {
  fechaInicio: string;
  fechaFin: string;
  totalIngresos: number;
  totalPagos: number;
  porMetodoPago: IngresosPorMetodoRow[];
}

// 3) Productos con stock bajo (sin filtros)
export interface StockBajoRow {
  codigo: string;
  nombre: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
}
export interface StockBajo {
  totalProductosEnAlerta: number;
  detalle: StockBajoRow[];
}

// 4) Técnicos con más órdenes cerradas
export interface TecnicosMasOrdenesQuery {
  fechaInicio?: string;
  fechaFin?: string;
  limit?: number; // 1-50, default 10
}
export interface TecnicoRankingRow {
  tecnicoId: number;
  nombre: string;
  ordenesCerradas: number;
}
export interface TecnicosMasOrdenes {
  detalle: TecnicoRankingRow[];
}

// 5) Órdenes por tipo de servicio (= tipo de equipo)
export interface DateRangeQuery {
  fechaInicio?: string;
  fechaFin?: string;
}
export interface OrdenesPorTipoRow {
  tipoEquipo: string;
  cantidad: number;
}
export interface OrdenesPorTipoServicio {
  totalOrdenes: number;
  detalle: OrdenesPorTipoRow[];
}

// 6) Clientes frecuentes / reincidentes
export interface ClientesFrecuentesQuery {
  limit?: number; // default 20
  minOrdenes?: number; // default 2
}
export interface ClienteFrecuenteRow {
  clienteId: number;
  nombre: string;
  telefono: string;
  totalOrdenes: number;
}
export interface ClientesFrecuentes {
  minOrdenes: number;
  detalle: ClienteFrecuenteRow[];
}

// 7) Órdenes con retraso en entrega (sin filtros)
export interface OrdenRetrasoRow {
  codigoOrden: string;
  cliente: string;
  telefono: string;
  estado: string;
  fechaEstimadaEntrega: string | null;
  diasRetraso: number;
}
export interface OrdenesConRetraso {
  totalOrdenesConRetraso: number;
  detalle: OrdenRetrasoRow[];
}

/** Claves usadas para armar la URL de cada reporte y su /pdf hermano. */
export const REPORTES = [
  'reparaciones-por-estado',
  'ingresos',
  'stock-bajo',
  'tecnicos-mas-ordenes',
  'ordenes-por-tipo-servicio',
  'clientes-frecuentes',
  'ordenes-retraso',
] as const;
export type ReporteKey = (typeof REPORTES)[number];
