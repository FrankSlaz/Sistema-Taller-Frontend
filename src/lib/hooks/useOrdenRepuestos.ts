import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordenRepuestosApi } from '../api/ordenRepuestos';
import type { CreateOrdenRepuestoPayload, OrdenRepuestosQuery } from '../../types/orden-repuesto';

export function useOrdenRepuestos(query: OrdenRepuestosQuery) {
  return useQuery({
    queryKey: ['orden-repuestos', query],
    queryFn: () => ordenRepuestosApi.findAll(query),
    placeholderData: (prev) => prev,
  });
}

/**
 * Cargar/quitar un repuesto toca varias cosas a la vez en el backend:
 * stock del producto, movimientos de inventario y total de la orden (que
 * a su vez cambia el saldo de pagos). Se invalidan todas.
 */
export function useOrdenRepuestoMutations(ordenId: number) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['orden-repuestos'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['reparaciones', 'detalle', ordenId] });
    queryClient.invalidateQueries({ queryKey: ['pagos'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['productos'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['productos-select'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['movimientos-inventario'], exact: false });
  };

  const create = useMutation({
    mutationFn: (payload: CreateOrdenRepuestoPayload) => ordenRepuestosApi.create(payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => ordenRepuestosApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, remove };
}
