import { useMutation, useQuery } from '@tanstack/react-query';
import { reportesApi } from '../api/reportes';

type Reporte = keyof typeof reportesApi;
type QueryDe<K extends Reporte> = Parameters<(typeof reportesApi)[K]['get']>[0];

/**
 * Datos de un reporte + descarga del PDF con los MISMOS filtros.
 * `placeholderData` mantiene la tabla anterior mientras se recalcula al
 * cambiar un filtro (sin parpadeo a "cargando").
 */
export function useReporte<K extends Reporte>(clave: K, query: QueryDe<K>) {
  const api = reportesApi[clave] as {
    get: (q: QueryDe<K>) => Promise<Awaited<ReturnType<(typeof reportesApi)[K]['get']>>>;
    pdf: (q: QueryDe<K>) => Promise<void>;
  };

  const datos = useQuery({
    queryKey: ['reportes', clave, query],
    queryFn: () => api.get(query),
    placeholderData: (prev) => prev,
  });

  const pdf = useMutation({ mutationFn: () => api.pdf(query) });

  return { ...datos, pdf };
}
