import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import { useChangeOwnPassword } from '../../../lib/hooks/useUsuarios';
import { ApiError } from '../../../lib/api/client';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const mutation = useChangeOwnPassword();
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPasswordActual('');
    setPasswordNueva('');
    setConfirmacion('');
    setTouched(false);
    mutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const coinciden = passwordNueva === confirmacion;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (passwordNueva.length < 8 || !coinciden) return;

    mutation.mutate({ passwordActual, passwordNueva }, { onSuccess: onClose });
  }

  const errorMessage =
    mutation.error instanceof ApiError ? mutation.error.message : mutation.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title="Cambiar mi contraseña">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Contraseña actual</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Contraseña nueva</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
          {touched && passwordNueva.length < 8 && (
            <p className="mt-1 text-xs text-red-600">Mínimo 8 caracteres</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Confirmar contraseña nueva</label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
          {touched && !coinciden && <p className="mt-1 text-xs text-red-600">Las contraseñas no coinciden</p>}
        </div>

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-graphite-600 hover:bg-graphite-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
          >
            {mutation.isPending ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
