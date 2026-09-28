import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pagosApi } from '../api/pagos';
import type { CreatePagoPayload, PagosQuery } from '../../types/pago';

export function usePagos(query: PagosQuery) {
  return useQuery({
    queryKey: ['pagos', query],
    queryFn: () => pagosApi.findAll(query),
    placeholderData: (prev) => prev,
  });
}

/**
 * Si se provee `ordenId`, además de invalidar el listado global de
 * pagos invalida el detalle de esa orden — el saldo pendiente que
 * muestra PagosPanel depende de los pagos registrados.
 */
export function usePagoMutations(ordenId?: number) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['pagos'], exact: false });
    if (ordenId) {
      queryClient.invalidateQueries({ queryKey: ['reparaciones', 'detalle', ordenId] });
    }
  };

  const create = useMutation({
    mutationFn: (payload: CreatePagoPayload) => pagosApi.create(payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => pagosApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, remove };
}
