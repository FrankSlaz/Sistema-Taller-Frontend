import { api, setStoredPerfil, setTokens, setUsuario } from './client';
import type { AuthMe, LoginPayload, LoginResponse } from '../../types/auth';

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload, { auth: false }),

  me: () => api.get<AuthMe>('/auth/me'),

  refresh: (refreshToken: string) =>
    // El backend devuelve un par nuevo (también rota el refresh token).
    api.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
      { auth: false },
    ),

  /** "¿Olvidaste tu contraseña?": enlace por correo o solicitud al administrador. */
  olvidePassword: (email: string) =>
    api.post<{ canal: 'correo' | 'administrador'; message: string }>(
      '/auth/olvide-password',
      { email },
      { auth: false },
    ),

  validarEnlace: (token: string) =>
    api.get<{ valido: boolean; email?: string }>(
      `/auth/restablecer-password?token=${encodeURIComponent(token)}`,
      { auth: false },
    ),

  restablecer: (token: string, passwordNueva: string) =>
    api.post<{ message: string }>('/auth/restablecer-password', { token, passwordNueva }, { auth: false }),
};

/**
 * Inicia sesión y guarda tokens, usuario y permisos. Se usa en el login y
 * después de cambiar la propia contraseña (el cambio cierra las sesiones
 * abiertas, incluida la actual: se vuelve a entrar con la nueva).
 */
export async function ingresar(email: string, password: string) {
  const data = await authApi.login({ email, password });
  setTokens(data.accessToken, data.refreshToken);
  setUsuario(data.usuario);
  try {
    setStoredPerfil(await authApi.me());
  } catch {
    // si falla, se piden al cargar la página
  }
  return data;
}
