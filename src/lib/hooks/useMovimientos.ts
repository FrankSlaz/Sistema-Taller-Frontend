import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { movimientosApi } from '../api/movimientos';
import type { CreateMovimientoPayload, MovimientosQuery } from '../../types/movimiento';

export function useMovimientos(query: MovimientosQuery) {
  return useQuery({
    queryKey: ['movimientos-inventario', query],
    queryFn: () => movimientosApi.findAll(query),
    placeholderData: (prev) => prev,
  });
}

export function useMovimientoMutations() {
  const queryClient = useQueryClient();

  const registrar = useMutation({
    mutationFn: (payload: CreateMovimientoPayload) => movimientosApi.registrar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos-inventario'], exact: false });
      // El movimiento cambia stockActual del producto: refrescar también el listado de productos.
      queryClient.invalidateQueries({ queryKey: ['productos'], exact: false });
    },
  });

  return { registrar };
}
