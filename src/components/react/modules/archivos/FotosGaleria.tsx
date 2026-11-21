import { Camera, ChevronLeft, ChevronRight, Loader2, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import AuthImage from './AuthImage';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { useArchivoMutations, useArchivos } from '../../../../lib/hooks/useArchivos';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import { ApiError } from '../../../../lib/api/client';
import { reducirImagen } from '../../../../lib/utils/imagen';
import { MAX_ARCHIVOS_POR_SUBIDA, type ArchivoEquipo } from '../../../../types/archivo';

interface FotosGaleriaProps {
  equipoId: number;
  /**
   * Si se provee, la galería funciona en el contexto de una orden: muestra
   * por defecto solo las fotos de esa orden y todo lo que se suba queda
   * vinculado a ella (registro de lo que se hizo). Sin ordenId es la
   * galería general del equipo (fotos de identificación).
   */
  ordenId?: number;
  ordenCodigo?: string;
}

function formatFechaHora(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function FotosGaleria({ equipoId, ordenId, ordenCodigo }: FotosGaleriaProps) {
  const [alcance, setAlcance] = useState<'orden' | 'equipo'>(ordenId ? 'orden' : 'equipo');
  const { data: archivos, isLoading, error } = useArchivos(
    equipoId,
    ordenId && alcance === 'orden' ? ordenId : undefined,
  );
  const { upload, update, remove } = useArchivoMutations(equipoId);

  const puedeCrear = usePermiso('archivos:crear');
  const puedeEditar = usePermiso('archivos:editar');
  const puedeEliminar = usePermiso('archivos:eliminar');

  const inputRef = useRef<HTMLInputElement>(null);
  const [descripcionLote, setDescripcionLote] = useState('');
  const [preparando, setPreparando] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
  const [descripcionEdit, setDescripcionEdit] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ArchivoEquipo | null>(null);

  const lista = archivos ?? [];
  const indice = lista.findIndex((a) => a.id === seleccionadoId);
  const actual = indice >= 0 ? lista[indice] : null;

  // Al cambiar de foto en el visor, la descripción editable se resetea a la de esa foto.
  useEffect(() => {
    setDescripcionEdit(actual?.descripcion ?? '');
  }, [actual?.id, actual?.descripcion]);

  // Teclado en el visor: Esc cierra, flechas navegan.
  useEffect(() => {
    if (!actual) return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (e.key === 'Escape') setSeleccionadoId(null);
      if (e.key === 'ArrowLeft' && indice > 0) setSeleccionadoId(lista[indice - 1].id);
      if (e.key === 'ArrowRight' && indice < lista.length - 1) setSeleccionadoId(lista[indice + 1].id);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actual, indice, lista]);

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const seleccion = Array.from(event.target.files ?? []);
    event.target.value = ''; // permite volver a elegir el mismo archivo

    if (seleccion.length === 0) return;
    if (seleccion.length > MAX_ARCHIVOS_POR_SUBIDA) {
      setErrorSubida(`Máximo ${MAX_ARCHIVOS_POR_SUBIDA} fotos por vez.`);
      return;
    }

    setErrorSubida(null);
    setPreparando(true);
    try {
      const listos: File[] = [];
      for (const file of seleccion) listos.push(await reducirImagen(file)); // de a una: cuida la memoria
      await upload.mutateAsync({ files: listos, ordenId, descripcion: descripcionLote.trim() || undefined });
      setDescripcionLote('');
    } catch (err) {
      setErrorSubida(err instanceof ApiError ? err.message : 'No se pudieron subir las fotos.');
    } finally {
      setPreparando(false);
    }
  }

  function handleGuardarDescripcion(event: FormEvent) {
    event.preventDefault();
    if (!actual) return;
    update.mutate({ id: actual.id, descripcion: descripcionEdit.trim() });
  }

  const subiendo = preparando || upload.isPending;

  if (error instanceof ApiError && error.statusCode === 403) {
    return <p className="text-sm text-graphite-400">No tienes permiso para ver las fotos.</p>;
  }

  return (
    <div className="space-y-4">
      {ordenId && (
        <div className="flex gap-1 text-sm">
          {(
            [
              ['orden', 'Esta orden'],
              ['equipo', 'Todas las del equipo'],
            ] as const
          ).map(([valor, label]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setAlcance(valor)}
              className={`rounded-md px-3 py-1 font-medium ${
                alcance === valor ? 'bg-graphite-900 text-white' : 'text-graphite-500 hover:bg-graphite-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {puedeCrear && (
        <div className="flex flex-col gap-2 rounded-md border border-dashed border-graphite-200 p-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={descripcionLote}
            onChange={(e) => setDescripcionLote(e.target.value)}
            maxLength={255}
            placeholder="Descripción (opcional): ej. Ingreso al taller, Después de reparar…"
            className="min-w-0 flex-1 rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
          {/* accept="image/*" + multiple: en celular el selector ofrece Cámara o Galería. */}
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
          >
            {subiendo ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
            {subiendo ? 'Subiendo…' : 'Agregar fotos'}
          </button>
        </div>
      )}

      {puedeCrear && ordenId && (
        <p className="-mt-2 text-xs text-graphite-400">
          Las fotos nuevas quedan vinculadas a la orden{ordenCodigo ? ` ${ordenCodigo}` : ''}.
        </p>
      )}

      {errorSubida && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorSubida}</p>}

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-md bg-graphite-100" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <p className="text-sm text-graphite-400">
          {alcance === 'orden' && ordenId
            ? 'Esta orden todavía no tiene fotos.'
            : 'Este equipo todavía no tiene fotos.'}
        </p>
      ) : (
        <>
          <p className="text-xs text-graphite-400">
            {lista.length} foto{lista.length === 1 ? '' : 's'}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {lista.map((archivo) => (
              <button
                key={archivo.id}
                type="button"
                onClick={() => setSeleccionadoId(archivo.id)}
                className="group relative aspect-square overflow-hidden rounded-md border border-graphite-200"
                aria-label={`Ver foto ${archivo.nombreArchivo ?? archivo.id}`}
              >
                <AuthImage
                  archivoId={archivo.id}
                  alt={archivo.descripcion ?? archivo.nombreArchivo ?? 'Foto del equipo'}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                {archivo.orden?.codigoOrden && alcance === 'equipo' && (
                  <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {archivo.orden.codigoOrden}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {actual && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-950/85 p-4"
          onClick={() => setSeleccionadoId(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative flex max-h-full w-full max-w-3xl flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="relative overflow-hidden rounded-lg bg-black">
              <AuthImage
                archivoId={actual.id}
                alt={actual.descripcion ?? actual.nombreArchivo ?? 'Foto del equipo'}
                className="mx-auto max-h-[60vh] w-auto max-w-full object-contain"
              />

              <button
                type="button"
                onClick={() => setSeleccionadoId(null)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
              {indice > 0 && (
                <button
                  type="button"
                  onClick={() => setSeleccionadoId(lista[indice - 1].id)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              {indice < lista.length - 1 && (
                <button
                  type="button"
                  onClick={() => setSeleccionadoId(lista[indice + 1].id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              )}
            </div>

            <div className="rounded-lg bg-white p-4 text-sm">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-graphite-400">
                <span>
                  {indice + 1} de {lista.length} · {formatFechaHora(actual.createdAt)}
                </span>
                {actual.orden?.codigoOrden && (
                  <a href={`/reparaciones/${actual.orden.id}`} className="font-medium text-graphite-700 hover:underline">
                    Orden {actual.orden.codigoOrden}
                  </a>
                )}
              </div>

              {puedeEditar ? (
                <form onSubmit={handleGuardarDescripcion} className="flex gap-2">
                  <input
                    type="text"
                    value={descripcionEdit}
                    onChange={(e) => setDescripcionEdit(e.target.value)}
                    maxLength={255}
                    placeholder="Sin descripción"
                    className="min-w-0 flex-1 rounded-md border border-graphite-200 px-3 py-1.5 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
                  />
                  <button
                    type="submit"
                    disabled={update.isPending || descripcionEdit.trim() === (actual.descripcion ?? '')}
                    className="rounded-md border border-graphite-200 px-3 py-1.5 text-sm font-medium text-graphite-700 hover:bg-graphite-50 disabled:opacity-50"
                  >
                    {update.isPending ? 'Guardando…' : 'Guardar'}
                  </button>
                </form>
              ) : (
                <p className="text-graphite-700">{actual.descripcion || 'Sin descripción'}</p>
              )}

              {update.error && (
                <p className="mt-2 text-sm text-red-700">
                  {update.error instanceof ApiError ? update.error.message : 'No se pudo guardar la descripción.'}
                </p>
              )}

              {puedeEliminar && (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(actual)}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline"
                >
                  <Trash2 size={14} />
                  Eliminar foto
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar foto"
        description="¿Seguro que deseas eliminar esta foto? Se borra también el archivo del servidor y no se puede deshacer."
        confirmLabel="Eliminar"
        isLoading={remove.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
      />
    </div>
  );
}
