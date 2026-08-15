import { useQuery } from '@tanstack/react-query';
import { herramientasApi } from '../api/herramientas';
import type { AsignacionesQuery } from '../../types/herramienta';

export function useAsignaciones(query: AsignacionesQuery) {
  return useQuery({
    queryKey: ['herramientas-asignaciones', query],
    queryFn: () => herramientasApi.findAsignaciones(query),
    placeholderData: (prev) => prev,
  });
}
