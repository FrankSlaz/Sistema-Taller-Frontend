/**
 * Espejo de backend-nest/src/modules/reportes (solo Administrador).
 * Cada reporte tiene GET /reportes/<clave> (JSON) y GET /reportes/<clave>/pdf
 * con los MISMOS filtros. Fechas: ISO string en el JSON.
 */

export type EstadoOrden =
  | 'RECIBIDO'
  | 'DIAGNOSTICO'
  | 'ESPERANDO_APROBACION'
  | 'EN_REPARACION'
  | 'PRUEBAS'
  | 'LISTO_ENTREGA'
  | 'ENTREGADO'
  | 'CANCELADO'
  | 'NO_REPARABLE';

export interface RangoFechas {
  fechaInicio?: string; // YYYY-MM-DD
  fechaFin?: string;
}

interface PeriodoJson {
  inicio: string;
  fin: string;
}

/** Fila estándar de una orden (reparaciones, retraso, cuentas por cobrar). */
export interface FilaOrden {
  ordenId: number;
  codigoOrden: string;
  fechaIngreso: string | null;
  fechaCompromiso: string | null;
  fechaEntrega: string | null;
  clienteId: number;
  cliente: string;
  telefono: string;
  equipo: string;
  estado: EstadoOrden;
  estadoEtiqueta: string;
  prioridad: string;
  tecnicos: string;
  diasEnTaller: number;
  total: number;
  pagado: number;
  saldo: number;
  atrasada: boolean;
}

// 9) Resumen ejecutivo ----------------------------------------------------
export interface ResumenEjecutivo {
  filtros: { periodo: PeriodoJson; periodoAnterior: PeriodoJson };
  kpis: {
    ingresos: number;
    ingresosAnterior: number;
    variacionIngresos: number | null;
    ordenesIngresadas: number;
    ordenesIngresadasAnterior: number;
    variacionIngresadas: number | null;
    ordenesEntregadas: number;
    ordenesEntregadasAnterior: number;
    variacionEntregadas: number | null;
    ticketPromedio: number;
    tiempoPromedioReparacion: number | null;
    tasaAprobacionPresupuestos: number | null;
    presupuestosPendientes: number;
    ordenesActivas: number;
    ordenesRetrasadas: number;
    saldoPorCobrar: number;
    productosEnAlerta: number;
    garantiasActivas: number;
    garantiasPorVencer: number;
  };
  topTiposEquipo: TipoEquipoRow[];
  topTecnicos: TecnicoRow[];
  alertas: { nivel: 'alta' | 'media' | 'info'; mensaje: string }[];
}

// 1) Reparaciones por estado ----------------------------------------------
export interface ReparacionesPorEstadoQuery extends RangoFechas {
  estados?: EstadoOrden[];
  tecnicoId?: number;
  prioridad?: string;
}
export interface ResumenEstadoRow {
  estado: EstadoOrden;
  etiqueta: string;
  cantidad: number;
  porcentaje: number;
  valor: number;
  saldo: number;
  diasPromedio: number | null;
}
export interface ReparacionesPorEstado {
  kpis: {
    totalOrdenes: number;
    activas: number;
    entregadas: number;
    fallidas: number;
    tasaExito: number | null;
    tiempoPromedioReparacion: number | null;
    valorEnProceso: number;
    saldoPendiente: number;
    atrasadas: number;
  };
  porEstado: ResumenEstadoRow[];
  detalle: FilaOrden[];
}

// 2) Ingresos ---------------------------------------------------------------
export interface IngresosQuery extends RangoFechas {
  metodoPago?: string;
}
export interface Ingresos {
  filtros: { granularidad: 'dia' | 'mes' };
  kpis: {
    totalIngresos: number;
    totalPagos: number;
    ordenesCobradas: number;
    ticketPromedio: number;
    promedioDiario: number;
    totalPeriodoAnterior: number;
    variacionVsAnterior: number | null;
    saldoPorCobrar: number;
    ordenesConSaldo: number;
  };
  repuestos: { unidades: number; venta: number; costo: number; margen: number; margenPorcentaje: number | null };
  porMetodoPago: { metodoPago: string; cantidadPagos: number; totalMonto: number; porcentaje: number }[];
  evolucion: { periodo: string; pagos: number; total: number }[];
  detalle: {
    fecha: string;
    ordenId: number;
    codigoOrden: string;
    cliente: string;
    metodoPago: string;
    referencia: string;
    monto: number;
  }[];
}

// 3) Stock -----------------------------------------------------------------
export type SituacionStock = 'TODOS' | 'EN_ALERTA' | 'SIN_STOCK' | 'BAJO_MINIMO' | 'NORMAL';
export interface StockQuery {
  situacion?: SituacionStock;
  categoriaId?: number;
  search?: string;
}
export interface StockRow {
  productoId: number;
  codigo: string;
  nombre: string;
  marca: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  situacion: 'SIN_STOCK' | 'BAJO_MINIMO' | 'NORMAL';
  consumo90Dias: number;
  coberturaDias: number | null;
  costoUnitario: number;
  precioReferencia: number;
  valorStock: number;
  sugeridoComprar: number;
  costoReposicion: number;
}
export interface Stock {
  kpis: {
    productos: number;
    unidades: number;
    valorInventario: number;
    valorVentaEstimado: number;
    sinStock: number;
    bajoMinimo: number;
    costoReposicion: number;
    sinMovimiento90Dias: number;
  };
  porCategoria: { categoria: string; productos: number; unidades: number; valor: number; alertas: number }[];
  detalle: StockRow[];
}

// 4) Técnicos ------------------------------------------------------------
export interface TecnicoRow {
  tecnicoId: number;
  nombre: string;
  activo: boolean;
  asignadasPeriodo: number;
  entregadas: number;
  enCurso: number;
  fallidas: number;
  tasaExito: number | null;
  tiempoPromedio: number | null;
  facturacion: number;
  ticketPromedio: number;
  diagnosticos: number;
}
export interface Tecnicos {
  kpis: {
    tecnicos: number;
    entregadas: number;
    enCurso: number;
    facturacion: number;
    tiempoPromedio: number | null;
    mejorTecnico: string | null;
  };
  detalle: TecnicoRow[];
}

// 5) Por tipo de equipo ---------------------------------------------------
export interface TipoEquipoRow {
  tipoEquipo: string;
  cantidad: number;
  porcentaje: number;
  enCurso: number;
  entregadas: number;
  fallidas: number;
  tasaExito: number | null;
  ticketPromedio: number;
  facturado: number;
  tiempoPromedio: number | null;
}
export interface OrdenesPorTipoServicio {
  kpis: {
    totalOrdenes: number;
    tiposDistintos: number;
    tipoMasFrecuente: string | null;
    marcaMasFrecuente: string | null;
    tipoMejorTicket: string | null;
  };
  detalle: TipoEquipoRow[];
  topMarcas: { tipoEquipo: string; marca: string; cantidad: number; porcentaje: number }[];
}

// 6) Clientes frecuentes --------------------------------------------------
export interface ClientesFrecuentesQuery extends RangoFechas {
  minOrdenes?: number;
  limit?: number;
}
export interface ClienteFrecuenteRow {
  clienteId: number;
  nombre: string;
  telefono: string;
  email: string;
  totalOrdenes: number;
  equiposDistintos: number;
  facturado: number;
  pagado: number;
  saldo: number;
  ticketPromedio: number;
  primeraVisita: string | null;
  ultimaVisita: string | null;
  diasSinVolver: number | null;
}
export interface ClientesFrecuentes {
  kpis: {
    clientesAtendidos: number;
    clientesRecurrentes: number;
    tasaRecurrencia: number | null;
    facturacionRecurrentes: number;
    participacionFacturacion: number | null;
    ordenesPorCliente: number;
  };
  detalle: ClienteFrecuenteRow[];
}

// 7) Órdenes con retraso --------------------------------------------------
export interface OrdenesRetrasoQuery {
  tecnicoId?: number;
  prioridad?: string;
  incluirProximas?: boolean;
  diasProximas?: number;
}
export interface FilaRetraso extends FilaOrden {
  diasRetraso: number; // negativo = días que faltan
  situacion: 'RETRASADA' | 'POR_VENCER';
}
export interface OrdenesConRetraso {
  kpis: {
    retrasadas: number;
    porVencer: number;
    retrasoPromedio: number | null;
    retrasoMaximo: number;
    criticas: number;
    valorComprometido: number;
    sinFechaCompromiso: number;
  };
  porTramo: { tramo: string; cantidad: number; valor: number }[];
  detalle: FilaRetraso[];
}

// 8) Cuentas por cobrar ---------------------------------------------------
export interface CuentasPorCobrarQuery {
  estados?: EstadoOrden[];
  antiguedadMinima?: number;
}
export interface FilaCuenta extends FilaOrden {
  porcentajePagado: number;
  ultimoPago: string | null;
  antiguedad: number;
}
export interface CuentasPorCobrar {
  kpis: {
    totalPorCobrar: number;
    ordenes: number;
    listasConSaldo: number;
    montoListas: number;
    entregadasConSaldo: number;
    montoEntregadas: number;
    sinAnticipo: number;
    saldoPromedio: number;
  };
  porTramo: { tramo: string; cantidad: number; saldo: number }[];
  detalle: FilaCuenta[];
}
