import { Check, Copy, RefreshCw } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import { useUsuarioMutations } from '../../../lib/hooks/useUsuarios';
import { ApiError } from '../../../lib/api/client';
import type { Usuario } from '../../../types/auth';

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
}

const ALFABETO = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Contraseña temporal fácil de dictar (sin 0/O, 1/l/I). */
function generar(largo = 10) {
  const bytes = new Uint32Array(largo);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join('');
}

/**
 * El Administrador asigna una contraseña TEMPORAL: el usuario debe
 * cambiarla al iniciar sesión (así el administrador no conoce la
 * definitiva). También desbloquea la cuenta, cierra las sesiones abiertas
 * y marca como atendidas sus solicitudes de "olvidé mi contraseña".
 */
export default function ResetPasswordModal({ open, onClose, usuario }: ResetPasswordModalProps) {
  const { resetPassword } = useUsuarioMutations();
  const [clave, setClave] = useState('');
  const [copiada, setCopiada] = useState(false);

  useEffect(() => {
    if (!open) return;
    setClave(generar());
    setCopiada(false);
    resetPassword.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, usuario]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(clave);
      setCopiada(true);
    } catch {
      // portapapeles no disponible: se copia a mano
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!usuario || clave.length < 8) return;
    resetPassword.mutate({ id: usuario.id, payload: { passwordNueva: clave } });
  }

  const errorMessage =
    resetPassword.error instanceof ApiError ? resetPassword.error.message : resetPassword.error ? 'Error inesperado' : null;

  if (!usuario) return null;
  const nombre = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ');

  if (resetPassword.isSuccess) {
    return (
      <Modal open={open} onClose={onClose} title="Contraseña temporal asignada">
        <div className="space-y-4">
          <p className="text-sm text-graphite-600">
            Entrégale esta contraseña a <strong>{nombre}</strong> por un medio seguro (en persona o por mensaje directo):
          </p>
          <div className="flex items-center gap-2 rounded-md border border-graphite-200 bg-graphite-50 px-3 py-2">
            <code className="flex-1 select-all font-mono text-lg tracking-wider text-graphite-900">{clave}</code>
            <button type="button" onClick={copiar} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-graphite-600 hover:bg-white">
              {copiada ? <Check size={14} /> : <Copy size={14} />}
              {copiada ? 'Copiada' : 'Copiar'}
            </button>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-xs text-graphite-500">
            <li>Al entrar, el sistema le pedirá cambiarla por una propia.</li>
            <li>Sus sesiones abiertas se cerraron y, si estaba bloqueado, quedó desbloqueado.</li>
          </ul>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800">
              Listo
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={`Contraseña temporal para ${usuario.nombre}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-graphite-500">
          Se asignará una contraseña temporal a <strong className="text-graphite-800">{nombre}</strong>. Deberá
          cambiarla al iniciar sesión, así nadie más conoce la definitiva.
        </p>

        <div>
          <label htmlFor="clave-temporal" className="mb-1 block text-sm font-medium text-graphite-900">
            Contraseña temporal
          </label>
          <div className="flex gap-2">
            <input
              id="clave-temporal"
              type="text"
              required
              minLength={8}
              maxLength={72}
              autoComplete="off"
              spellCheck={false}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 font-mono text-sm tracking-wider focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
            <button
              type="button"
              onClick={() => setClave(generar())}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-graphite-200 px-3 text-sm font-medium text-graphite-700 hover:bg-graphite-50"
            >
              <RefreshCw size={14} />
              Otra
            </button>
          </div>
          <p className={`mt-1 text-xs ${clave.length < 8 ? 'text-red-600' : 'text-graphite-400'}`}>
            Mínimo 8 caracteres. Puedes usar la generada o escribir otra.
          </p>
        </div>

        {errorMessage && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-graphite-600 hover:bg-graphite-50">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={resetPassword.isPending || clave.length < 8}
            className="rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
          >
            {resetPassword.isPending ? 'Asignando…' : 'Asignar contraseña temporal'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
