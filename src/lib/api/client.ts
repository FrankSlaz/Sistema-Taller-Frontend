import { PUBLIC_API_URL } from 'astro:env/client';
import type { ApiErrorResponse, ApiResponse } from '../../types/api';
import type { Usuario } from '../../types/auth';

const TOKEN_KEY = 'sistema_taller_token';
const REFRESH_KEY = 'sistema_taller_refresh_token';
const USUARIO_KEY = 'sistema_taller_usuario';

export class ApiError extends Error {
  statusCode: number;
  details?: string | string[];

  constructor(message: string, statusCode: number, details?: string | string[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USUARIO_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

/**
 * GET /auth/me devuelve el payload del JWT + permisos, pero NO el
 * perfil completo (sin nombre/apellido/telefono). Como no existe un
 * endpoint de "mi perfil completo" self-service, se guarda el objeto
 * `usuario` que sí devuelve POST /auth/login como snapshot para
 * mostrar en la UI (navbar, Mi Perfil). Puede quedar desactualizado
 * si el perfil se edita desde otra sesión — se refresca en el
 * próximo login.
 */
export function setUsuario(usuario: Usuario) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export function getStoredUsuario(): Usuario | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USUARIO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
}

/**
 * Wrapper sobre fetch para la API de Sistema Taller.
 * - Antepone PUBLIC_API_URL (http://localhost:3000/api en desarrollo).
 * - Adjunta el Bearer token salvo que auth: false.
 * - Desempaqueta { success, data } del TransformInterceptor.
 * - Lanza ApiError con el mensaje del HttpExceptionFilter en caso de fallo.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth) {
    const token = getToken();
    if (token) {
      (finalHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${PUBLIC_API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = json as ApiErrorResponse | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody!.message.join(', ')
      : (errorBody?.message ?? 'Error de comunicación con el servidor');
    throw new ApiError(message, response.status, errorBody?.message);
  }

  const successBody = json as ApiResponse<T>;
  return successBody.data;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
};
