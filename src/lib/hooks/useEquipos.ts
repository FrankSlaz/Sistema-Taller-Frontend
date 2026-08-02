import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { equiposApi } from '../api/equipos';
import type { EquipoPayload, EquiposQuery } from '../../types/equipo';

const equiposKey = (query: EquiposQuery) => ['equipos', query] as const;

export function useEquipos(query: EquiposQuery) {
  return useQuery({
    queryKey: equiposKey(query),
    queryFn: () => equiposApi.findAll(query),
    placeholderData: (prev) => prev,
  });
}

export function useEquipoMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['equipos'] });

  const create = useMutation({
    mutationFn: (payload: EquipoPayload) => equiposApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<EquipoPayload> }) =>
      equiposApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => equiposApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
