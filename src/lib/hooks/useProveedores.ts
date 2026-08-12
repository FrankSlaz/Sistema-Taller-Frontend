import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { proveedoresApi } from '../api/proveedores';
import type { ProveedorPayload } from '../../types/proveedor';

export function useProveedores() {
  return useQuery({
    queryKey: ['proveedores'],
    queryFn: proveedoresApi.findAll,
  });
}

export function useProveedorMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['proveedores'] });

  const create = useMutation({
    mutationFn: (payload: ProveedorPayload) => proveedoresApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ProveedorPayload> }) =>
      proveedoresApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => proveedoresApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
