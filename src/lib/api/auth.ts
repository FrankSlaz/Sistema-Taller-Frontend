import { api } from './client';
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
};
