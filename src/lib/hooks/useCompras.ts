import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { comprasApi } from '../api/compras';
import type { ComprasQuery, CreateCompraPayload } from '../../types/compra';

export function useCompras(query: ComprasQuery) {
  return useQuery({
    queryKey: ['compras', query],
    queryFn: () => comprasApi.findAll(query),
    placeholderData: (prev) => prev,
  });
}

export function useCompraMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (payload: CreateCompraPayload) => comprasApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'], exact: false });
      // Cada línea de compra genera una ENTRADA de inventario: refrescar productos y movimientos.
      queryClient.invalidateQueries({ queryKey: ['productos'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['movimientos-inventario'], exact: false });
    },
  });

  return { create };
}
