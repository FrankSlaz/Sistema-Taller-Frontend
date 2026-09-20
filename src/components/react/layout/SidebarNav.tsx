import { useAuth } from '../../../lib/hooks/useAuth';
import QueryProvider from '../providers/QueryProvider';

interface NavItem {
  label: string;
  href: string;
  /** Si es true, solo se muestra a usuarios con rol Administrador. */
  adminOnly?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarNavProps {
  groups: NavGroup[];
  currentPath: string;
}

/**
 * El sidebar necesita saber el rol del usuario para ocultar secciones
 * exclusivas de Administrador, pero la autenticación es puramente
 * client-side (token en localStorage, sin cookies) — un componente
 * Astro (SSR) no tiene forma de leerla en el servidor. Por eso el
 * nav completo vive en esta isla React en vez de en Sidebar.astro.
 *
 * Mientras se resuelve /auth/me, los ítems adminOnly se ocultan por
 * defecto (en vez de mostrarse y luego desaparecer) para no dar un
 * flash de "Usuarios/Compras/Herramientas" a alguien que no es admin.
 */
function SidebarNavContent({ groups, currentPath }: SidebarNavProps) {
  const { rolNombre, isLoading } = useAuth();
  const esAdmin = rolNombre === 'Administrador';

  return (
    <nav className="flex-1 space-y-6 px-3 py-6">
      {groups.map((group) => {
        const items = group.items.filter((item) => !item.adminOnly || (!isLoading && esAdmin));
        if (items.length === 0) return null;

        return (
          <div key={group.title}>
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-graphite-400">
              {group.title}
            </p>
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive = currentPath.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-graphite-800 text-white'
                          : 'text-graphite-200 hover:bg-graphite-800 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export default function SidebarNav(props: SidebarNavProps) {
  return (
    <QueryProvider>
      <SidebarNavContent {...props} />
    </QueryProvider>
  );
}
