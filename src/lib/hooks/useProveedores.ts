import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { proveedoresApi } from '../api/proveedores';
import type { ProveedorPayload } from '../../types/proveedor';
import type { FiltroActivo } from '../../components/react/ui/Activacion';

/** Por defecto solo activos (para elegir); 'todos' para gestionar o filtrar. */
export function useProveedores(estado?: FiltroActivo) {
  return useQuery({
    queryKey: ['proveedores', estado ?? 'activos'],
    queryFn: () => proveedoresApi.findAll(estado),
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

  const cambiarActivo = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => proveedoresApi.cambiarActivo(id, activo),
    onSuccess: invalidate,
  });

  return { create, update, cambiarActivo };
}
