import { ArrowLeft, Check, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import QueryProvider from '../../providers/QueryProvider';
import { useRoles, useRolPermisos, useSetRolPermisos } from '../../../../lib/hooks/useRoles';
import { usePermisos } from '../../../../lib/hooks/usePermisos';
import { ApiError } from '../../../../lib/api/client';
import { ACCIONES_PERMISO, RECURSOS_PERMISO, accionLabel, recursoLabel } from '../../../../types/permiso';

interface PermisosMatrixProps {
  rolId: number;
}

function PermisosMatrixContent({ rolId }: PermisosMatrixProps) {
  const { data: roles } = useRoles();
  const { data: catalogo, isLoading: isLoadingCatalogo, error: catalogoError } = usePermisos();
  const { data: asignados, isLoading: isLoadingAsignados } = useRolPermisos(rolId);
  const setPermisos = useSetRolPermisos(rolId);

  const [seleccion, setSeleccion] = useState<Set<number>>(new Set());
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (asignados) {
      setSeleccion(new Set(asignados));
      setDirty(false);
    }
  }, [asignados]);

  const rol = roles?.find((r) => r.id === rolId);

  // Mapa "recurso:accion" -> id de permiso, para ubicar rápido la celda.
  const permisoIdPorClave = useMemo(() => {
    const map = new Map<string, number>();
    catalogo?.forEach((p) => map.set(`${p.recurso}:${p.accion}`, p.id));
    return map;
  }, [catalogo]);

  function toggle(permisoId: number) {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(permisoId)) next.delete(permisoId);
      else next.add(permisoId);
      return next;
    });
    setDirty(true);
  }

  function toggleFila(recurso: string) {
    const idsFila = ACCIONES_PERMISO.map((accion) => permisoIdPorClave.get(`${recurso}:${accion}`)).filter(
      (id): id is number => !!id,
    );
    const todasMarcadas = idsFila.every((id) => seleccion.has(id));

    setSeleccion((prev) => {
      const next = new Set(prev);
      idsFila.forEach((id) => (todasMarcadas ? next.delete(id) : next.add(id)));
      return next;
    });
    setDirty(true);
  }

  function handleGuardar() {
    setPermisos.mutate(Array.from(seleccion), { onSuccess: () => setDirty(false) });
  }

  const errorMessage =
    catalogoError instanceof ApiError
      ? catalogoError.message
      : setPermisos.error instanceof ApiError
        ? setPermisos.error.message
        : null;

  if (catalogoError) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {errorMessage}. La gestión de permisos requiere rol Administrador.
      </div>
    );
  }

  const isLoading = isLoadingCatalogo || isLoadingAsignados;

  return (
    <div className="space-y-4">
      <a
        href="/roles"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite-500 hover:text-graphite-900"
      >
        <ArrowLeft size={15} />
        Volver a roles
      </a>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-graphite-900">{rol?.nombre ?? `Rol #${rolId}`}</h2>
          {rol?.descripcion && <p className="text-sm text-graphite-400">{rol.descripcion}</p>}
        </div>

        <button
          type="button"
          onClick={handleGuardar}
          disabled={!dirty || setPermisos.isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-50"
        >
          <Save size={15} />
          {setPermisos.isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>

      {errorMessage && !catalogoError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
      )}

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-graphite-100" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-graphite-200">
          <table className="min-w-full divide-y divide-graphite-100 text-sm">
            <thead className="bg-graphite-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-graphite-400">
                  Recurso
                </th>
                {ACCIONES_PERMISO.map((accion) => (
                  <th
                    key={accion}
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-graphite-400"
                  >
                    {accionLabel(accion)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100 bg-white">
              {RECURSOS_PERMISO.map((recurso) => (
                <tr key={recurso} className="hover:bg-graphite-50">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleFila(recurso)}
                      className="font-medium text-graphite-900 hover:underline"
                      title="Marcar/desmarcar toda la fila"
                    >
                      {recursoLabel(recurso)}
                    </button>
                  </td>
                  {ACCIONES_PERMISO.map((accion) => {
                    const permisoId = permisoIdPorClave.get(`${recurso}:${accion}`);
                    if (!permisoId) {
                      return <td key={accion} className="px-4 py-3 text-center text-graphite-300">—</td>;
                    }
                    const checked = seleccion.has(permisoId);
                    return (
                      <td key={accion} className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggle(permisoId)}
                          className={`inline-flex h-5 w-5 items-center justify-center rounded border ${
                            checked
                              ? 'border-graphite-900 bg-graphite-900 text-white'
                              : 'border-graphite-300 bg-white'
                          }`}
                          aria-label={`${recursoLabel(recurso)} · ${accionLabel(accion)}`}
                          aria-pressed={checked}
                        >
                          {checked && <Check size={13} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PermisosMatrix(props: PermisosMatrixProps) {
  return (
    <QueryProvider>
      <PermisosMatrixContent {...props} />
    </QueryProvider>
  );
}
