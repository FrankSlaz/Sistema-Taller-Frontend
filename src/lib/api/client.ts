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

/**
 * Renovación de sesión. El access token dura poco (JWT_EXPIRES_IN); cuando
 * una petición autenticada vuelve con 401 se intenta UNA vez obtener un par
 * de tokens nuevo con el refresh token y se repite la petición.
 *
 * Si varias peticiones fallan a la vez, comparten la misma promesa de
 * refresh (no se dispara un /auth/refresh por cada una).
 */
let refreshEnCurso: Promise<boolean> | null = null;

function refrescarSesion(): Promise<boolean> {
  if (refreshEnCurso) return refreshEnCurso;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.resolve(false);

  refreshEnCurso = (async () => {
    try {
      const response = await fetch(`${PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return false;
      const json = (await response.json()) as ApiResponse<{ accessToken: string; refreshToken: string }>;
      setTokens(json.data.accessToken, json.data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshEnCurso = null;
    }
  })();

  return refreshEnCurso;
}

/** Sesión irrecuperable (refresh vencido o inválido): limpiar y volver al login. */
function cerrarSesionExpirada() {
  clearTokens();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

/**
 * fetch autenticado con reintento tras refresh. `buildInit` se invoca en
 * cada intento para que el reintento lleve el access token NUEVO.
 */
async function fetchConSesion(path: string, buildInit: () => RequestInit): Promise<Response> {
  const response = await fetch(`${PUBLIC_API_URL}${path}`, buildInit());
  if (response.status !== 401) return response;

  if (await refrescarSesion()) {
    const reintento = await fetch(`${PUBLIC_API_URL}${path}`, buildInit());
    if (reintento.status !== 401) return reintento;
  }

  cerrarSesionExpirada();
  return response;
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

  // Con FormData NO se setea Content-Type: el navegador lo arma solo,
  // con el boundary del multipart. Forzar application/json lo rompería.
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const buildInit = (): RequestInit => {
    const finalHeaders: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(headers as Record<string, string> | undefined),
    };

    if (auth) {
      const token = getToken();
      if (token) finalHeaders.Authorization = `Bearer ${token}`;
    }

    return {
      ...rest,
      headers: finalHeaders,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    };
  };

  // Las rutas públicas (login, refresh) no intentan renovar sesión: un 401
  // ahí es "credenciales inválidas", no "token vencido".
  const response = auth
    ? await fetchConSesion(path, buildInit)
    : await fetch(`${PUBLIC_API_URL}${path}`, buildInit());

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

/**
 * Trae un recurso binario autenticado (imágenes de equipos, PDFs). Un
 * <img src> o <a href> planos no pueden mandar el header Authorization,
 * así que se hace fetch manual con el Bearer token y se devuelve el Blob
 * para que el llamador cree un object URL.
 */
export async function fetchBlob(path: string): Promise<Blob> {
  const response = await fetchConSesion(path, (): RequestInit => {
    const token = getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    return { headers };
  });

  if (!response.ok) {
    // El error de estos endpoints sigue viniendo como JSON del HttpExceptionFilter.
    const errorBody = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody!.message.join(', ')
      : (errorBody?.message ?? 'No se pudo obtener el archivo');
    throw new ApiError(message, response.status, errorBody?.message);
  }

  return response.blob();
}

/** Descarga un archivo binario autenticado (los /pdf de Reportes) disparando "Guardar como". */
export async function downloadFile(path: string, filename: string): Promise<void> {
  const blob = await fetchBlob(path);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
