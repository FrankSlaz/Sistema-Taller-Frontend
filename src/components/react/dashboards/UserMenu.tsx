import { LogOut, User } from 'lucide-react';
import QueryProvider from '../providers/QueryProvider';
import { useAuth } from '../../../lib/hooks/useAuth';

function UserMenuContent() {
  const { usuario, rolNombre, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className="h-9 w-32 animate-pulse rounded-md bg-graphite-100" />;
  }

  return (
    <div className="flex items-center gap-3">
      <a
        href="/perfil"
        className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-graphite-50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-graphite-800 text-white">
          <User size={16} />
        </span>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium leading-none text-graphite-900">
            {usuario ? `${usuario.nombre} ${usuario.apellido ?? ''}`.trim() : 'Invitado'}
          </p>
          <p className="text-xs text-graphite-400">{rolNombre ?? 'Sin sesión'}</p>
        </div>
      </a>

      <button
        type="button"
        onClick={logout}
        className="flex h-9 w-9 items-center justify-center rounded-md text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
        aria-label="Cerrar sesión"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}

export default function UserMenu() {
  return (
    <QueryProvider>
      <UserMenuContent />
    </QueryProvider>
  );
}
