import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '../api/usuarios';
import type { CreateUsuarioPayload, UpdateUsuarioPayload } from '../../types/usuario';
import type { ChangePasswordPayload, ResetPasswordPayload } from '../../types/auth';

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: usuariosApi.findAll,
    retry: false,
  });
}

export function useUsuarioMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['usuarios'] });

  const create = useMutation({
    mutationFn: (payload: CreateUsuarioPayload) => usuariosApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUsuarioPayload }) =>
      usuariosApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => usuariosApi.remove(id),
    onSuccess: invalidate,
  });

  const resetPassword = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ResetPasswordPayload }) =>
      usuariosApi.resetPassword(id, payload),
  });

  return { create, update, remove, resetPassword };
}

/** Autoservicio: cualquier usuario logueado cambia su propia contraseña. */
export function useChangeOwnPassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => usuariosApi.changeOwnPassword(payload),
  });
}
