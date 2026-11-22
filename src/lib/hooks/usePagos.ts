import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pagosApi } from '../api/pagos';
import type { CreateDevolucionPayload, CreatePagoPayload, PagosQuery } from '../../types/pago';

export function usePagos(query: PagosQuery) {
  return useQuery({
    queryKey: ['pagos', query],
    queryFn: () => pagosApi.findAll(query),
    placeholderData: (prev) => prev,
  });
}

/**
 * Pagos, devoluciones y anulaciones cambian el saldo de la orden: se
 * refresca el listado de pagos, el detalle de la orden y el seguimiento.
 */
export function usePagoMutations(ordenId?: number) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['pagos'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['reportes'], exact: false });
    if (ordenId) {
      queryClient.invalidateQueries({ queryKey: ['reparaciones', 'detalle', ordenId] });
    }
  };

  const create = useMutation({
    mutationFn: (payload: CreatePagoPayload) => pagosApi.create(payload),
    onSuccess: invalidate,
  });

  const devolver = useMutation({
    mutationFn: (payload: CreateDevolucionPayload) => pagosApi.devolver(payload),
    onSuccess: invalidate,
  });

  const anular = useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) => pagosApi.anular(id, motivo),
    onSuccess: invalidate,
  });

  return { create, devolver, anular };
}
