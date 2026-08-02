import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { authApi } from '../../../lib/api/auth';
import { setTokens } from '../../../lib/api/client';
import { ApiError } from '../../../lib/api/client';
import QueryProvider from '../providers/QueryProvider';

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      window.location.href = '/dashboard';
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate({ email, password });
  }

  const errorMessage =
    mutation.error instanceof ApiError ? mutation.error.message : mutation.error ? 'Error inesperado' : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-graphite-900">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          placeholder="usuario@taller.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-graphite-900">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          placeholder="••••••••"
        />
      </div>

      {errorMessage && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-graphite-800 disabled:opacity-60"
      >
        {mutation.isPending ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  );
}

export default function LoginForm() {
  return (
    <QueryProvider>
      <LoginFormContent />
    </QueryProvider>
  );
}
