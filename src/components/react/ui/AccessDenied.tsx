interface AccessDeniedProps {
  message?: string;
}

/**
 * Se muestra cuando la petición inicial de un panel falla con 403
 * (el usuario está autenticado pero su rol no tiene el permiso
 * "recurso:ver" correspondiente). Es un fallback de UX — el guard
 * real ya rechazó la petición en el backend (PermissionsGuard).
 */
export default function AccessDenied({
  message = 'No tenés permiso para ver este módulo. Si creés que deberías tenerlo, pedile a un Administrador que revise los permisos de tu rol.',
}: AccessDeniedProps) {
  return (
    <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-700">{message}</div>
  );
}
