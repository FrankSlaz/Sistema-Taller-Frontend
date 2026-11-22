import { DatabaseBackup, Download, History, Info, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import QueryProvider from '../../providers/QueryProvider';
import AccessDenied from '../../ui/AccessDenied';
import Badge from '../../ui/Badge';
import ConfirmDialog from '../../ui/ConfirmDialog';
import Modal from '../../ui/Modal';
import { useBackupMutations, useBackups } from '../../../../lib/hooks/useBackups';
import { ApiError } from '../../../../lib/api/client';
import type { Backup, TipoBackup } from '../../../../types/backup';
import Tip from '../../ui/Tip';

const TIPO_LABEL: Record<TipoBackup, { label: string; className: string }> = {
  manual: { label: 'Manual', className: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  'pre-restauracion': {
    label: 'Seguridad (antes de restaurar)',
    className: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  subido: { label: 'Subido', className: 'bg-purple-50 text-purple-700 ring-purple-600/20' },
};

const PALABRA_CONFIRMACION = 'RESTAURAR';

function formatTamano(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFecha(value: string) {
  return new Date(value).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mensaje(error: unknown) {
  return error instanceof ApiError ? error.message : error ? 'Error inesperado' : null;
}

function BackupsPanelContent() {
  const { data: backups = [], isLoading, error } = useBackups();
  const { crear, subir, descargar, eliminar, restaurar } = useBackupMutations();
  const inputRef = useRef<HTMLInputElement>(null);

  const [aviso, setAviso] = useState<string | null>(null);
  const [eliminarTarget, setEliminarTarget] = useState<Backup | null>(null);
  const [restaurarTarget, setRestaurarTarget] = useState<Backup | null>(null);

  if (error instanceof ApiError && (error.statusCode === 403 || error.statusCode === 401)) {
    return <AccessDenied message="Solo un Administrador puede gestionar los backups." />;
  }

  const ultimo = backups[0];
  const errorAccion = mensaje(crear.error ?? subir.error ?? descargar.error ?? eliminar.error);

  function handleSubir(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setAviso(null);
    subir.mutate(file, { onSuccess: (b) => setAviso(`Backup subido como ${b.nombre}. Ya puedes restaurarlo.`) });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="text-sm text-graphite-500">
          {ultimo ? (
            <>
              Último backup: <span className="font-medium text-graphite-900">{formatFecha(ultimo.fecha)}</span>
            </>
          ) : (
            'Todavía no hay backups.'
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <input ref={inputRef} type="file" accept=".gz,application/gzip" className="hidden" onChange={handleSubir} />
          <button
            type="button"
            disabled={subir.isPending}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md border border-graphite-200 px-3 py-2 text-sm font-medium text-graphite-700 hover:bg-graphite-50 disabled:opacity-60"
          >
            <Upload size={15} />
            {subir.isPending ? 'Subiendo…' : 'Subir backup'}
          </button>
          <button
            type="button"
            disabled={crear.isPending}
            onClick={() => {
              setAviso(null);
              crear.mutate(undefined, { onSuccess: (b) => setAviso(`Backup creado: ${b.nombre}`) });
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
          >
            <DatabaseBackup size={15} />
            {crear.isPending ? 'Generando…' : 'Crear backup ahora'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
        <Info size={14} className="mt-0.5 shrink-0" />
        <p>
          El backup incluye toda la base de datos (clientes, órdenes, inventario, usuarios…). Las fotos de equipos y
          el logo están en la carpeta <code>uploads/</code> del servidor y se respaldan aparte. Descarga los backups
          y guárdalos fuera de esta computadora (USB, nube): si el disco falla, los backups del servidor se pierden
          con él.
        </p>
      </div>

      {aviso && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{aviso}</p>}
      {errorAccion && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorAccion}</p>}

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-lg bg-graphite-100" />
      ) : backups.length === 0 ? (
        <p className="py-8 text-center text-sm text-graphite-400">
          No hay backups. Usa “Crear backup ahora” para generar el primero.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-graphite-100 text-left text-xs text-graphite-400">
                <th className="py-2 font-medium">Fecha</th>
                <th className="py-2 font-medium">Tipo</th>
                <th className="py-2 font-medium">Archivo</th>
                <th className="py-2 text-right font-medium">Tamaño</th>
                <th className="py-2 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.nombre} className="border-b border-graphite-50">
                  <td className="whitespace-nowrap py-2.5 text-graphite-900">{formatFecha(b.fecha)}</td>
                  <td className="py-2.5">
                    <Badge label={TIPO_LABEL[b.tipo].label} className={TIPO_LABEL[b.tipo].className} />
                  </td>
                  <td className="max-w-xs truncate py-2.5 font-mono text-xs text-graphite-500" title={b.nombre}>
                    {b.nombre}
                  </td>
                  <td className="whitespace-nowrap py-2.5 text-right text-graphite-700">{formatTamano(b.tamano)}</td>
                  <td className="py-2.5">
                    <div className="flex justify-end gap-1">
                      <Tip label="Descargar">
                        <button
                          type="button"
                          onClick={() => descargar.mutate(b.nombre)}
                          className="rounded-md p-1.5 text-graphite-500 hover:bg-graphite-100 hover:text-graphite-900"
                          aria-label="Descargar"
                        >
                          <Download size={15} />
                        </button>
                      </Tip>
                      <Tip label="Restaurar">
                        <button
                          type="button"
                          onClick={() => setRestaurarTarget(b)}
                          className="rounded-md p-1.5 text-graphite-500 hover:bg-amber-50 hover:text-amber-700"
                          aria-label="Restaurar"
                        >
                          <History size={15} />
                        </button>
                      </Tip>
                      <Tip label="Eliminar">
                        <button
                          type="button"
                          onClick={() => setEliminarTarget(b)}
                          className="rounded-md p-1.5 text-graphite-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </Tip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!eliminarTarget}
        onClose={() => setEliminarTarget(null)}
        title="Eliminar backup"
        description={`¿Eliminar ${eliminarTarget?.nombre ?? ''}? Si no lo descargaste antes, no se podrá recuperar.`}
        confirmLabel="Eliminar"
        isLoading={eliminar.isPending}
        onConfirm={() => {
          if (eliminarTarget) eliminar.mutate(eliminarTarget.nombre, { onSuccess: () => setEliminarTarget(null) });
        }}
      />

      <RestaurarModal
        backup={restaurarTarget}
        onClose={() => setRestaurarTarget(null)}
        isPending={restaurar.isPending}
        error={mensaje(restaurar.error)}
        onConfirm={(confirmacion) => {
          if (!restaurarTarget) return;
          restaurar.mutate(
            { nombre: restaurarTarget.nombre, confirmacion },
            {
              onSuccess: (r) => {
                setRestaurarTarget(null);
                setAviso(
                  `Base restaurada desde ${r.restaurado}. El estado anterior quedó guardado en ${r.backupSeguridad}.`,
                );
              },
            },
          );
        }}
        onOpen={() => restaurar.reset()}
      />
    </div>
  );
}

interface RestaurarModalProps {
  backup: Backup | null;
  onClose: () => void;
  onConfirm: (confirmacion: string) => void;
  onOpen: () => void;
  isPending: boolean;
  error: string | null;
}

function RestaurarModal({ backup, onClose, onConfirm, onOpen, isPending, error }: RestaurarModalProps) {
  const [texto, setTexto] = useState('');

  useEffect(() => {
    if (backup) {
      setTexto('');
      onOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backup]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (texto === PALABRA_CONFIRMACION) onConfirm(texto);
  }

  return (
    <Modal open={!!backup} onClose={isPending ? () => undefined : onClose} title="Restaurar backup">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <p className="font-semibold">Esto reemplaza TODOS los datos actuales del sistema</p>
          <p className="mt-1">
            Todo lo registrado después del{' '}
            <span className="font-medium">{backup ? formatFecha(backup.fecha) : ''}</span> se perderá. Antes de
            restaurar se crea automáticamente un backup de seguridad del estado actual.
          </p>
        </div>

        <p className="break-all font-mono text-xs text-graphite-500">{backup?.nombre}</p>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Escribe <span className="font-mono">{PALABRA_CONFIRMACION}</span> para confirmar
          </label>
          <input
            type="text"
            autoFocus
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            disabled={isPending}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 font-mono text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-md px-4 py-2 text-sm font-medium text-graphite-600 hover:bg-graphite-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending || texto !== PALABRA_CONFIRMACION}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? 'Restaurando…' : 'Restaurar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function BackupsPanel() {
  return (
    <QueryProvider>
      <BackupsPanelContent />
    </QueryProvider>
  );
}
