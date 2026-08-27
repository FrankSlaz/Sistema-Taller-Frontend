import { useQuery } from '@tanstack/react-query';
import { permisosApi } from '../api/permisos';

export function usePermisos() {
  return useQuery({
    queryKey: ['permisos'],
    queryFn: permisosApi.findAll,
    staleTime: Infinity, // catálogo fijo, no cambia en runtime
  });
}
