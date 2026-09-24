import { useMutation, useQuery } from '@tanstack/react-query';
import { reportesApi } from '../api/reportes';
import type {
  ClientesFrecuentesQuery,
  DateRangeQuery,
  IngresosQuery,
  ReparacionesPorEstadoQuery,
  TecnicosMasOrdenesQuery,
} from '../../types/reporte';

export function useReparacionesPorEstado(query: ReparacionesPorEstadoQuery) {
  return useQuery({
    queryKey: ['reportes', 'reparaciones-por-estado', query],
    queryFn: () => reportesApi.reparacionesPorEstado(query),
  });
}

export function useIngresos(query: IngresosQuery) {
  return useQuery({
    queryKey: ['reportes', 'ingresos', query],
    queryFn: () => reportesApi.ingresos(query),
    enabled: !!query.fechaInicio && !!query.fechaFin, // ambas fechas son obligatorias en el backend
  });
}

export function useStockBajo() {
  return useQuery({
    queryKey: ['reportes', 'stock-bajo'],
    queryFn: reportesApi.stockBajo,
  });
}

export function useTecnicosMasOrdenes(query: TecnicosMasOrdenesQuery) {
  return useQuery({
    queryKey: ['reportes', 'tecnicos-mas-ordenes', query],
    queryFn: () => reportesApi.tecnicosMasOrdenes(query),
  });
}

export function useOrdenesPorTipoServicio(query: DateRangeQuery) {
  return useQuery({
    queryKey: ['reportes', 'ordenes-por-tipo-servicio', query],
    queryFn: () => reportesApi.ordenesPorTipoServicio(query),
  });
}

export function useClientesFrecuentes(query: ClientesFrecuentesQuery) {
  return useQuery({
    queryKey: ['reportes', 'clientes-frecuentes', query],
    queryFn: () => reportesApi.clientesFrecuentes(query),
  });
}

export function useOrdenesConRetraso() {
  return useQuery({
    queryKey: ['reportes', 'ordenes-retraso'],
    queryFn: reportesApi.ordenesConRetraso,
  });
}

/**
 * Envuelve cualquiera de las funciones *Pdf de reportesApi en una
 * mutation, solo para tener isPending/error/reset ya resueltos por
 * TanStack Query en vez de manejar loading a mano en cada reporte.
 */
export function useDownloadPdf(descargar: () => Promise<void>) {
  return useMutation({ mutationFn: descargar });
}
