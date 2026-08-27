import { KeyRound, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
import ChangePasswordModal from '../../forms/ChangePasswordModal';
import QueryProvider from '../../providers/QueryProvider';
import { useAuth } from '../../../../lib/hooks/useAuth';

function PerfilPanelContent() {
  const { usuario, rolNombre, isLoading } = useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-lg bg-graphite-100" />;
  }

  if (!usuario) {
    return (
      <p className="text-sm text-graphite-500">
        No se pudo cargar tu perfil. Intenta volver a iniciar sesión.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-graphite-800 text-white">
          <User size={24} />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-graphite-900">
            {usuario.nombre} {usuario.apellido ?? ''}
          </h2>
          <p className="text-sm text-graphite-400">{rolNombre ?? usuario.rol?.nombre}</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-4 border-t border-graphite-100 pt-4 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-graphite-400" />
          <div>
            <dt className="text-xs text-graphite-400">Email</dt>
            <dd className="text-sm text-graphite-900">{usuario.email}</dd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Phone size={16} className="text-graphite-400" />
          <div>
            <dt className="text-xs text-graphite-400">Teléfono</dt>
            <dd className="text-sm text-graphite-900">{usuario.telefono ?? '—'}</dd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-graphite-400" />
          <div>
            <dt className="text-xs text-graphite-400">Rol</dt>
            <dd className="text-sm text-graphite-900">{rolNombre ?? usuario.rol?.nombre}</dd>
          </div>
        </div>
      </dl>

      <p className="text-xs text-graphite-400">
        Estos datos se cargaron al iniciar sesión. Si algo cambió desde otra pantalla, volvé a
        iniciar sesión para verlo actualizado aquí.
      </p>

      <div className="border-t border-graphite-100 pt-4">
        <button
          type="button"
          onClick={() => setChangePasswordOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-graphite-200 px-4 py-2 text-sm font-medium text-graphite-700 hover:bg-graphite-50"
        >
          <KeyRound size={15} />
          Cambiar mi contraseña
        </button>
      </div>

      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </div>
  );
}

export default function PerfilPanel() {
  return (
    <QueryProvider>
      <PerfilPanelContent />
    </QueryProvider>
  );
}
