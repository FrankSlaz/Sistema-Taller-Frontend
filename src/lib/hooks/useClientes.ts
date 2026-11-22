import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientesApi } from '../api/clientes';
import type { ClientePayload, ClientesQuery } from '../../types/cliente';

const clientesKey = (query: ClientesQuery) => ['clientes', query] as const;

export function useClientes(query: ClientesQuery) {
  return useQuery({
    queryKey: clientesKey(query),
    queryFn: () => clientesApi.findAll(query),
    placeholderData: (prev) => prev,
  });
}

export function useClienteMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['clientes'] });
    queryClient.invalidateQueries({ queryKey: ['equipos'] });
  };

  const create = useMutation({
    mutationFn: (payload: ClientePayload) => clientesApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ClientePayload> }) =>
      clientesApi.update(id, payload),
    onSuccess: invalidate,
  });

  const cambiarActivo = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => clientesApi.cambiarActivo(id, activo),
    onSuccess: invalidate,
  });

  return { create, update, cambiarActivo };
}
