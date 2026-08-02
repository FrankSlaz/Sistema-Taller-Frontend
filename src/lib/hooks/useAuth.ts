import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { clearTokens } from '../api/client';

/**
 * Hook de sesión para islas React. Consulta /auth/me usando el
 * token guardado en localStorage por el formulario de login.
 */
export function useAuth() {
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
  });

  function logout() {
    clearTokens();
    window.location.href = '/login';
  }

  return {
    usuario: query.data,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    error: query.error,
    logout,
  };
}
