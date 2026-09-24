import { api, downloadFile } from './client';
import type {
  ClientesFrecuentes,
  ClientesFrecuentesQuery,
  DateRangeQuery,
  Ingresos,
  IngresosQuery,
  OrdenesConRetraso,
  OrdenesPorTipoServicio,
  ReparacionesPorEstado,
  ReparacionesPorEstadoQuery,
  StockBajo,
  TecnicosMasOrdenes,
  TecnicosMasOrdenesQuery,
} from '../../types/reporte';

function toQueryString(params: object): string {
  const usp = new URLSearchParams();
  Object.entries(params as Record<string, string | number | undefined>).forEach(([key, value]) => {
    if (value !== undefined && value !== '') usp.set(key, String(value));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export const reportesApi = {
  reparacionesPorEstado: (query: ReparacionesPorEstadoQuery) =>
    api.get<ReparacionesPorEstado>(`/reportes/reparaciones-por-estado${toQueryString(query)}`),
  reparacionesPorEstadoPdf: (query: ReparacionesPorEstadoQuery) =>
    downloadFile(
      `/reportes/reparaciones-por-estado/pdf${toQueryString(query)}`,
      'reparaciones-por-estado.pdf',
    ),

  ingresos: (query: IngresosQuery) => api.get<Ingresos>(`/reportes/ingresos${toQueryString(query)}`),
  ingresosPdf: (query: IngresosQuery) =>
    downloadFile(`/reportes/ingresos/pdf${toQueryString(query)}`, 'ingresos.pdf'),

  stockBajo: () => api.get<StockBajo>('/reportes/stock-bajo'),
  stockBajoPdf: () => downloadFile('/reportes/stock-bajo/pdf', 'stock-bajo.pdf'),

  tecnicosMasOrdenes: (query: TecnicosMasOrdenesQuery) =>
    api.get<TecnicosMasOrdenes>(`/reportes/tecnicos-mas-ordenes${toQueryString(query)}`),
  tecnicosMasOrdenesPdf: (query: TecnicosMasOrdenesQuery) =>
    downloadFile(`/reportes/tecnicos-mas-ordenes/pdf${toQueryString(query)}`, 'tecnicos-mas-ordenes.pdf'),

  ordenesPorTipoServicio: (query: DateRangeQuery) =>
    api.get<OrdenesPorTipoServicio>(`/reportes/ordenes-por-tipo-servicio${toQueryString(query)}`),
  ordenesPorTipoServicioPdf: (query: DateRangeQuery) =>
    downloadFile(
      `/reportes/ordenes-por-tipo-servicio/pdf${toQueryString(query)}`,
      'ordenes-por-tipo-servicio.pdf',
    ),

  clientesFrecuentes: (query: ClientesFrecuentesQuery) =>
    api.get<ClientesFrecuentes>(`/reportes/clientes-frecuentes${toQueryString(query)}`),
  clientesFrecuentesPdf: (query: ClientesFrecuentesQuery) =>
    downloadFile(`/reportes/clientes-frecuentes/pdf${toQueryString(query)}`, 'clientes-frecuentes.pdf'),

  ordenesConRetraso: () => api.get<OrdenesConRetraso>('/reportes/ordenes-retraso'),
  ordenesConRetrasoPdf: () => downloadFile('/reportes/ordenes-retraso/pdf', 'ordenes-retraso.pdf'),
};
