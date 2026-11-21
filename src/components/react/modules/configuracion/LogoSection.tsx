import { ImageUp, Trash2 } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';
import QueryProvider from '../../providers/QueryProvider';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { useConfiguracionPublica, useLogoMutations } from '../../../../lib/hooks/useConfiguracion';
import { useAuth } from '../../../../lib/hooks/useAuth';
import { logoUrlDe } from '../../../../lib/branding';
import { ApiError } from '../../../../lib/api/client';

const MAX_BYTES = 2 * 1024 * 1024;
const TIPOS = ['image/png', 'image/jpeg', 'image/webp'];

/**
 * Logo del taller: se muestra en la barra superior, en el login y como
 * ícono de la pestaña del navegador. Tras subirlo/quitarlo se recarga la
 * página porque esos lugares se renderizan en el servidor.
 *
 * Isla independiente del formulario de datos generales: vive en su propia
 * tarjeta (columna derecha de /configuracion).
 */
function LogoSectionContent() {
  // Se espera a /auth/me antes de decidir: en el servidor no hay sesión y,
  // si el cliente usara el rol guardado en localStorage en el primer
  // render, el HTML no coincidiría (error de hidratación).
  const { rolNombre, isLoading: cargandoSesion } = useAuth();
  const esAdmin = !cargandoSesion && rolNombre === 'Administrador';
  const { data: publica, isLoading } = useConfiguracionPublica();
  const { subir, eliminar } = useLogoMutations();
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [confirmarQuitar, setConfirmarQuitar] = useState(false);

  const logoUrl = publica ? logoUrlDe(publica.logoVersion, publica.tieneLogo) : null;

  function handleArchivo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // permite volver a elegir el mismo archivo
    if (!file) return;

    setErrorLocal(null);
    if (!TIPOS.includes(file.type)) {
      setErrorLocal('El logo debe ser una imagen PNG, JPG o WEBP.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrorLocal('El logo no puede pesar más de 2 MB.');
      return;
    }
    subir.mutate(file, { onSuccess: () => window.location.reload() });
  }

  const errorApi = subir.error ?? eliminar.error;
  const error = errorLocal ?? (errorApi ? apiMensaje(errorApi) : null);
  const ocupado = subir.isPending || eliminar.isPending;

  return (
    <div className="space-y-4">
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-graphite-200 bg-graphite-50 p-4">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-md bg-graphite-100" />
        ) : logoUrl ? (
          <img src={logoUrl} alt="Logo actual" className="h-full w-full object-contain" />
        ) : (
          <div className="text-center text-graphite-400">
            <ImageUp size={32} className="mx-auto mb-2" />
            <p className="text-sm">Sin logo</p>
          </div>
        )}
      </div>

      {publica && (
        <p className="text-center text-sm font-medium text-graphite-900">{publica.nombreTaller}</p>
      )}

      {cargandoSesion ? (
        <div className="h-9 animate-pulse rounded-md bg-graphite-100" />
      ) : esAdmin ? (
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleArchivo}
          />
          <button
            type="button"
            disabled={ocupado}
            onClick={() => inputRef.current?.click()}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
          >
            <ImageUp size={15} />
            {subir.isPending ? 'Subiendo…' : logoUrl ? 'Cambiar logo' : 'Subir logo'}
          </button>
          {logoUrl && (
            <button
              type="button"
              disabled={ocupado}
              onClick={() => setConfirmarQuitar(true)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 size={15} />
              Quitar logo
            </button>
          )}
        </div>
      ) : (
        <p className="text-center text-xs text-graphite-400">Solo un Administrador puede cambiar el logo.</p>
      )}

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <ul className="space-y-1 border-t border-graphite-100 pt-3 text-xs text-graphite-400">
        <li>Se muestra en la barra superior, el inicio de sesión y la pestaña del navegador.</li>
        <li>PNG, JPG o WEBP, máximo 2 MB.</li>
        <li>Recomendado: imagen cuadrada con fondo transparente.</li>
      </ul>

      <ConfirmDialog
        open={confirmarQuitar}
        onClose={() => setConfirmarQuitar(false)}
        title="Quitar logo"
        description="El sistema volverá a mostrar la marca genérica en la barra y en la pestaña."
        confirmLabel="Quitar logo"
        isLoading={eliminar.isPending}
        onConfirm={() => eliminar.mutate(undefined, { onSuccess: () => window.location.reload() })}
      />
    </div>
  );
}

function apiMensaje(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Error inesperado';
}

export default function LogoSection() {
  return (
    <QueryProvider>
      <LogoSectionContent />
    </QueryProvider>
  );
}
