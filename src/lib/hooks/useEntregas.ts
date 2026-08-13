import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { entregasApi } from '../api/entregas';
import { ApiError } from '../api/client';
import type { CreateEntregaPayload, EntregasQuery } from '../../types/entrega';

export function useEntregas(query: EntregasQuery) {
  return useQuery({
    queryKey: ['entregas', query],
    queryFn: () => entregasApi.findAll(query),
    placeholderData: (prev) => prev,
  });
}

/**
 * Entrega de una orden puntual. 404 significa "todavía no tiene
 * entrega" (no es un error real), así que se expone como `exists: false`
 * en vez de dejar `error` con el 404 crudo.
 */
export function useEntregaByOrden(ordenId: number) {
  const query = useQuery({
    queryKey: ['entregas', 'orden', ordenId],
    queryFn: () => entregasApi.findByOrden(ordenId),
    enabled: !!ordenId,
    retry: false,
  });

  const notFound = query.error instanceof ApiError && query.error.statusCode === 404;

  return { ...query, exists: !notFound && !!query.data, notFound };
}

export function useEntregaMutations(ordenId?: number) {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (payload: CreateEntregaPayload) => entregasApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'], exact: false });
      if (ordenId) {
        queryClient.invalidateQueries({ queryKey: ['reparaciones', 'detalle', ordenId] });
      }
    },
  });

  return { create };
}
