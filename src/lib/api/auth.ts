import { api } from './client';
import type { LoginPayload, LoginResponse, Usuario } from '../../types/auth';

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload, { auth: false }),

  me: () => api.get<Usuario>('/auth/me'),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string }>(
      '/auth/refresh',
      { refreshToken },
      { auth: false },
    ),
};
