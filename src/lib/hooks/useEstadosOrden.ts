import { useQuery } from '@tanstack/react-query';
import { estadosOrdenApi } from '../api/estadosOrden';

export function useEstadosOrden() {
  return useQuery({
    queryKey: ['estados-orden'],
    queryFn: estadosOrdenApi.findAll,
    staleTime: Infinity, // catálogo fijo, no cambia en runtime
  });
}
