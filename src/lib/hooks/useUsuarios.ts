import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '../api/usuarios';
import { ingresar } from '../api/auth';
import { getStoredUsuario } from '../api/client';
import type { CreateUsuarioPayload, UpdateUsuarioPayload } from '../../types/usuario';
import type { FiltroActivo } from '../../components/react/ui/Activacion';
import type { ChangePasswordPayload, ResetPasswordPayload } from '../../types/auth';

/** Por defecto solo activos (para asignar); 'todos' para la gestión. */
export function useUsuarios(estado?: FiltroActivo) {
  return useQuery({
    queryKey: ['usuarios', estado ?? 'activos'],
    queryFn: () => usuariosApi.findAll(estado),
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

  const cambiarActivo = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => usuariosApi.cambiarActivo(id, activo),
    onSuccess: invalidate,
  });

  const resetPassword = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ResetPasswordPayload }) =>
      usuariosApi.resetPassword(id, payload),
    onSuccess: invalidate,
  });

  const desbloquear = useMutation({
    mutationFn: (id: number) => usuariosApi.desbloquear(id),
    onSuccess: invalidate,
  });

  const descartarSolicitud = useMutation({
    mutationFn: (id: number) => usuariosApi.descartarSolicitud(id),
    onSuccess: invalidate,
  });

  return { create, update, cambiarActivo, resetPassword, desbloquear, descartarSolicitud };
}

/** Autoservicio: cualquier usuario logueado cambia su propia contraseña. */
export function useChangeOwnPassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const r = await usuariosApi.changeOwnPassword(payload);
      // El cambio cierra todas las sesiones abiertas (también esta): se
      // vuelve a entrar con la contraseña nueva, sin pedir nada.
      const email = getStoredUsuario()?.email;
      if (email) await ingresar(email, payload.passwordNueva);
      return r;
    },
  });
}

/** "Olvidé mi contraseña" pendientes (solo Administrador). */
export function useSolicitudesPassword(habilitado = true) {
  return useQuery({
    queryKey: ['usuarios', 'solicitudes-password'],
    queryFn: () => usuariosApi.solicitudesPassword(),
    enabled: habilitado,
    retry: false,
  });
}
