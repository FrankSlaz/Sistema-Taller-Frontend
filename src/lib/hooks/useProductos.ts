import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productosApi } from '../api/productos';
import type { CreateProductoPayload, ProductosQuery, UpdateProductoPayload } from '../../types/producto';

export function useProductos(query: ProductosQuery) {
  return useQuery({
    queryKey: ['productos', query],
    queryFn: () => productosApi.findAll(query),
    placeholderData: (prev) => prev,
  });
}

export function useProductoMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['productos'], exact: false });

  const create = useMutation({
    mutationFn: (payload: CreateProductoPayload) => productosApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<UpdateProductoPayload> }) =>
      productosApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => productosApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
