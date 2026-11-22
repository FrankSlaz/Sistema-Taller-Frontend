import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, KeyRound, MailCheck, ShieldAlert, UserCog } from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import QueryProvider from '../providers/QueryProvider';
import { authApi } from '../../../lib/api/auth';
import { ApiError, clearTokens, getStoredUsuario } from '../../../lib/api/client';
import { useChangeOwnPassword } from '../../../lib/hooks/useUsuarios';

/**
 * Pantallas de acceso sin el menú del sistema: olvidé mi contraseña,
 * restablecer con el enlace del correo y cambio obligatorio de una
 * contraseña temporal.
 */

const inputCls =
  'w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800';
const botonCls =
  'w-full rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-graphite-800 disabled:opacity-60';
const msg = (e: unknown) => (e instanceof ApiError ? e.message : e ? 'No se pudo completar. Intenta de nuevo.' : null);

function Aviso({ icono, tono, children }: { icono: ReactNode; tono: 'bien' | 'info' | 'mal'; children: ReactNode }) {
  const t = { bien: 'bg-green-50 text-green-800', info: 'bg-blue-50 text-blue-900', mal: 'bg-red-50 text-red-700' }[tono];
  return (
    <div className={`flex gap-3 rounded-md p-3 text-sm ${t}`}>
      <span className="mt-0.5 shrink-0">{icono}</span>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

const volver = (
  <a href="/login" className="block text-center text-sm font-medium text-graphite-600 hover:text-graphite-900 hover:underline">
    Volver a iniciar sesión
  </a>
);

/** Nueva contraseña + confirmación, con las mismas reglas que el backend. */
function CamposNueva({
  nueva,
  setNueva,
  confirmar,
  setConfirmar,
  intento,
  distintaDe,
}: {
  nueva: string;
  setNueva: (v: string) => void;
  confirmar: string;
  setConfirmar: (v: string) => void;
  intento: boolean;
  distintaDe?: string;
}) {
  return (
    <>
      <div>
        <label htmlFor="nueva" className="mb-1 block text-sm font-medium text-graphite-900">
          Contraseña nueva
        </label>
        <input id="nueva" type="password" required minLength={8} autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} className={inputCls} />
        <p className={`mt-1 text-xs ${intento && nueva.length < 8 ? 'text-red-600' : 'text-graphite-400'}`}>Mínimo 8 caracteres.</p>
        {intento && distintaDe !== undefined && nueva && nueva === distintaDe && (
          <p className="mt-1 text-xs text-red-600">Debe ser distinta de la contraseña temporal.</p>
        )}
      </div>
      <div>
        <label htmlFor="confirmar" className="mb-1 block text-sm font-medium text-graphite-900">
          Repite la contraseña nueva
        </label>
        <input id="confirmar" type="password" required autoComplete="new-password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} className={inputCls} />
        {intento && confirmar && confirmar !== nueva && <p className="mt-1 text-xs text-red-600">No coinciden.</p>}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// ¿Olvidaste tu contraseña?
// ---------------------------------------------------------------------------

function OlvidePasswordContent() {
  const [email, setEmail] = useState('');
  const pedir = useMutation({ mutationFn: (e: string) => authApi.olvidePassword(e) });

  if (pedir.data) {
    return (
      <div className="space-y-5">
        <Aviso icono={pedir.data.canal === 'correo' ? <MailCheck size={18} /> : <UserCog size={18} />} tono="bien">
          <p>{pedir.data.message}</p>
          {pedir.data.canal === 'correo' && <p className="text-xs">El enlace vence en 30 minutos.</p>}
        </Aviso>
        {volver}
      </div>
    );
  }

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        if (email.trim()) pedir.mutate(email.trim());
      }}
      className="space-y-4"
    >
      <p className="text-sm text-graphite-500">
        Escribe el correo con el que entras al sistema. Te enviaremos un enlace para crear una nueva contraseña o, si no
        hay correo configurado, avisaremos al administrador.
      </p>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-graphite-900">
          Correo electrónico
        </label>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="usuario@taller.com" />
      </div>
      {msg(pedir.error) && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{msg(pedir.error)}</p>}
      <button type="submit" disabled={pedir.isPending} className={botonCls}>
        {pedir.isPending ? 'Enviando…' : 'Recuperar acceso'}
      </button>
      {volver}
    </form>
  );
}

export function OlvidePasswordForm() {
  return (
    <QueryProvider>
      <OlvidePasswordContent />
    </QueryProvider>
  );
}

// ---------------------------------------------------------------------------
// Restablecer con el enlace del correo
// ---------------------------------------------------------------------------

function RestablecerContent() {
  const [token] = useState(() => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('token') ?? ''));
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [intento, setIntento] = useState(false);
  const enlace = useQuery({ queryKey: ['enlace', token], queryFn: () => authApi.validarEnlace(token), enabled: !!token, retry: false });
  const guardar = useMutation({ mutationFn: () => authApi.restablecer(token, nueva) });

  if (guardar.isSuccess) {
    return (
      <div className="space-y-5">
        <Aviso icono={<CheckCircle2 size={18} />} tono="bien">
          <p>Listo: tu contraseña cambió. Las sesiones que tenías abiertas se cerraron.</p>
        </Aviso>
        <a href="/login" className={`block text-center ${botonCls}`}>
          Iniciar sesión
        </a>
      </div>
    );
  }
  if (!token || (enlace.data && !enlace.data.valido) || enlace.isError) {
    return (
      <div className="space-y-5">
        <Aviso icono={<ShieldAlert size={18} />} tono="mal">
          <p>El enlace no es válido o ya venció (dura 30 minutos y sirve una sola vez).</p>
        </Aviso>
        <a href="/olvide-password" className={`block text-center ${botonCls}`}>
          Pedir un enlace nuevo
        </a>
        {volver}
      </div>
    );
  }
  if (enlace.isLoading) return <div className="h-40 animate-pulse rounded-md bg-graphite-100" />;

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        setIntento(true);
        if (nueva.length >= 8 && nueva === confirmar) guardar.mutate();
      }}
      className="space-y-4"
    >
      <p className="text-sm text-graphite-500">
        Crea una nueva contraseña para <strong className="text-graphite-900">{enlace.data?.email}</strong>.
      </p>
      <CamposNueva nueva={nueva} setNueva={setNueva} confirmar={confirmar} setConfirmar={setConfirmar} intento={intento} />
      {msg(guardar.error) && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{msg(guardar.error)}</p>}
      <button type="submit" disabled={guardar.isPending} className={botonCls}>
        {guardar.isPending ? 'Guardando…' : 'Guardar contraseña'}
      </button>
    </form>
  );
}

export function RestablecerForm() {
  return (
    <QueryProvider>
      <RestablecerContent />
    </QueryProvider>
  );
}

// ---------------------------------------------------------------------------
// Cambio obligatorio (contraseña temporal)
// ---------------------------------------------------------------------------

function CambioObligatorioContent() {
  const usuario = getStoredUsuario();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [intento, setIntento] = useState(false);
  const cambiar = useChangeOwnPassword();

  // Sin sesión no hay nada que cambiar.
  useEffect(() => {
    if (!usuario) window.location.href = '/login';
  }, [usuario]);

  function salir() {
    clearTokens();
    window.location.href = '/login';
  }

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        setIntento(true);
        if (nueva.length < 8 || nueva !== confirmar || nueva === actual) return;
        cambiar.mutate({ passwordActual: actual, passwordNueva: nueva }, { onSuccess: () => (window.location.href = '/dashboard') });
      }}
      className="space-y-4"
    >
      <Aviso icono={<KeyRound size={18} />} tono="info">
        <p>
          {usuario?.nombre ? `${usuario.nombre}, estás` : 'Estás'} usando una contraseña temporal. Elige una propia para
          continuar: solo tú la vas a conocer.
        </p>
      </Aviso>
      <div>
        <label htmlFor="actual" className="mb-1 block text-sm font-medium text-graphite-900">
          Contraseña temporal
        </label>
        <input id="actual" type="password" required autoComplete="current-password" value={actual} onChange={(e) => setActual(e.target.value)} className={inputCls} />
      </div>
      <CamposNueva nueva={nueva} setNueva={setNueva} confirmar={confirmar} setConfirmar={setConfirmar} intento={intento} distintaDe={actual} />
      {msg(cambiar.error) && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{msg(cambiar.error)}</p>}
      <button type="submit" disabled={cambiar.isPending} className={botonCls}>
        {cambiar.isPending ? 'Guardando…' : 'Guardar y entrar'}
      </button>
      <button type="button" onClick={salir} className="block w-full text-center text-sm font-medium text-graphite-500 hover:text-graphite-900">
        Cerrar sesión
      </button>
    </form>
  );
}

export function CambioObligatorioForm() {
  return (
    <QueryProvider>
      <CambioObligatorioContent />
    </QueryProvider>
  );
}
