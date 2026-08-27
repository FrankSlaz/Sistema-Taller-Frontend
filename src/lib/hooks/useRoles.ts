import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../api/roles';
import type { RolPayload } from '../../types/rol';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.findAll,
  });
}

export function useRolMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['roles'] });

  const create = useMutation({
    mutationFn: (payload: RolPayload) => rolesApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<RolPayload> }) =>
      rolesApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => rolesApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

export function useRolPermisos(rolId: number) {
  return useQuery({
    queryKey: ['roles', 'permisos', rolId],
    queryFn: () => rolesApi.getPermisos(rolId),
    enabled: !!rolId,
  });
}

export function useSetRolPermisos(rolId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permisoIds: number[]) => rolesApi.setPermisos(rolId, permisoIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', 'permisos', rolId] });
      // Los permisos de un rol afectan lo que puede ver/hacer cualquier
      // usuario logueado con ese rol: refrescar también /auth/me.
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
