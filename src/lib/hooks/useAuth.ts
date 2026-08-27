import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { clearTokens, getStoredUsuario } from '../api/client';

/**
 * Hook de sesión para islas React.
 *
 * Combina dos fuentes porque GET /auth/me no trae el perfil completo
 * (solo el payload del JWT + permisos, ver types/auth.ts AuthMe):
 * - `usuario`: snapshot guardado en localStorage al hacer login
 *   (nombre/apellido/email/telefono/rol) — para mostrar en la UI.
 * - `permisos`/`rolNombre`: siempre frescos desde /auth/me — son la
 *   fuente de verdad para las decisiones de autorización en el
 *   cliente (ver hasPermiso). Si un Administrador le cambia los
 *   permisos a un rol, se reflejan en el siguiente refetch sin
 *   necesidad de volver a loguearse.
 */
export function useAuth() {
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
  });

  const usuario = getStoredUsuario();
  const permisos = query.data?.permisos ?? [];

  function hasPermiso(permiso: string): boolean {
    return permisos.includes(permiso);
  }

  function logout() {
    clearTokens();
    window.location.href = '/login';
  }

  return {
    usuario,
    rolNombre: query.data?.rolNombre ?? usuario?.rol?.nombre,
    permisos,
    hasPermiso,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    error: query.error,
    logout,
  };
}

/**
 * Atajo para gatear un botón/sección por un permiso puntual
 * ("recurso:accion"). Es una capa de UX, no de seguridad real — el
 * backend (PermissionsGuard) es quien realmente lo hace cumplir.
 */
export function usePermiso(permiso: string): boolean {
  const { hasPermiso } = useAuth();
  return hasPermiso(permiso);
}
