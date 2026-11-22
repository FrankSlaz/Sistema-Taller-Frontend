import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Inicio } from '../../types/dashboard';

/**
 * Inicio: una sola petición (GET /dashboard) que el backend arma según el
 * rol y los permisos. Se refresca sola cada minuto y al volver a la pestaña,
 * para que las alertas estén al día durante la jornada.
 */
export function useInicio() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<Inicio>('/dashboard'),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}
