import { api, downloadFile } from './client';
import type {
  ClientesFrecuentes,
  ClientesFrecuentesQuery,
  CuentasPorCobrar,
  CuentasPorCobrarQuery,
  Ingresos,
  IngresosQuery,
  OrdenesConRetraso,
  OrdenesPorTipoServicio,
  OrdenesRetrasoQuery,
  RangoFechas,
  ReparacionesPorEstado,
  ReparacionesPorEstadoQuery,
  ResumenEjecutivo,
  Stock,
  StockQuery,
  Tecnicos,
} from '../../types/reporte';

/** Arrays van separados por coma (estados=RECIBIDO,DIAGNOSTICO). */
function toQueryString(params: object): string {
  const usp = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      if (value.length) usp.set(key, value.join(','));
      return;
    }
    usp.set(key, String(value));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

/** GET JSON + descarga PDF con los mismos filtros. */
function reporte<Q extends object, R>(clave: string, archivo: string) {
  return {
    get: (query: Q) => api.get<R>(`/reportes/${clave}${toQueryString(query)}`),
    pdf: (query: Q) => downloadFile(`/reportes/${clave}/pdf${toQueryString(query)}`, `${archivo}-${hoy()}.pdf`),
  };
}

export const reportesApi = {
  resumen: reporte<RangoFechas, ResumenEjecutivo>('resumen', 'resumen-ejecutivo'),
  reparacionesPorEstado: reporte<ReparacionesPorEstadoQuery, ReparacionesPorEstado>(
    'reparaciones-por-estado',
    'reparaciones-por-estado',
  ),
  ingresos: reporte<IngresosQuery, Ingresos>('ingresos', 'ingresos'),
  stock: reporte<StockQuery, Stock>('stock', 'stock'),
  tecnicos: reporte<RangoFechas, Tecnicos>('tecnicos', 'tecnicos'),
  ordenesPorTipoServicio: reporte<RangoFechas, OrdenesPorTipoServicio>(
    'ordenes-por-tipo-servicio',
    'ordenes-por-tipo-equipo',
  ),
  clientesFrecuentes: reporte<ClientesFrecuentesQuery, ClientesFrecuentes>(
    'clientes-frecuentes',
    'clientes-frecuentes',
  ),
  ordenesConRetraso: reporte<OrdenesRetrasoQuery, OrdenesConRetraso>('ordenes-retraso', 'ordenes-con-retraso'),
  cuentasPorCobrar: reporte<CuentasPorCobrarQuery, CuentasPorCobrar>('cuentas-por-cobrar', 'cuentas-por-cobrar'),
};
