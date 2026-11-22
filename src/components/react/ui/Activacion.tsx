import { Power, RotateCcw } from 'lucide-react';
import Modal from './Modal';
import Tip from './Tip';

/**
 * Activar / desactivar registros maestros (clientes, equipos, usuarios,
 * productos, categorías, proveedores). Nada se elimina: un registro
 * inactivo deja de ofrecerse para operaciones nuevas, conserva su
 * historial y se puede volver a activar. Espejo de backend common/activo.
 */
export type FiltroActivo = 'activos' | 'inactivos' | 'todos';

const OPCIONES: { valor: FiltroActivo; etiqueta: string }[] = [
  { valor: 'activos', etiqueta: 'Activos' },
  { valor: 'inactivos', etiqueta: 'Inactivos' },
  { valor: 'todos', etiqueta: 'Todos' },
];

/** Selector Activos / Inactivos / Todos. */
export function FiltroActivoSelector({
  valor,
  onChange,
}: {
  valor: FiltroActivo;
  onChange: (v: FiltroActivo) => void;
}) {
  return (
    <div className="inline-flex shrink-0 rounded-md border border-graphite-200 p-0.5" role="group" aria-label="Filtrar por estado">
      {OPCIONES.map((o) => (
        <button
          key={o.valor}
          type="button"
          onClick={() => onChange(o.valor)}
          aria-pressed={valor === o.valor}
          className={`rounded px-3 py-1.5 text-xs font-medium ${
            valor === o.valor ? 'bg-graphite-900 text-white' : 'text-graphite-600 hover:bg-graphite-50'
          }`}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}

export function BadgeActivo({ activo, femenino = false }: { activo: boolean | null | undefined; femenino?: boolean }) {
  const si = activo !== false;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        si ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-graphite-100 text-graphite-600 ring-graphite-500/20'
      }`}
    >
      {si ? (femenino ? 'Activa' : 'Activo') : femenino ? 'Inactiva' : 'Inactivo'}
    </span>
  );
}

/** Botón de la fila: desactivar (si está activo) o activar. */
export function BotonActivo({
  activo,
  nombre,
  onClick,
  disabled,
  size = 15,
}: {
  activo: boolean | null | undefined;
  nombre: string;
  onClick: () => void;
  disabled?: boolean;
  size?: number;
}) {
  const si = activo !== false;
  return (
    <Tip label={si ? 'Desactivar' : 'Activar'}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`rounded-md p-1.5 text-graphite-400 disabled:opacity-40 ${
          si ? 'hover:bg-amber-50 hover:text-amber-700' : 'hover:bg-green-50 hover:text-green-700'
        }`}
        aria-label={si ? `Desactivar ${nombre}` : `Activar ${nombre}`}
      >
        {si ? <Power size={size} /> : <RotateCcw size={size} />}
      </button>
    </Tip>
  );
}

/**
 * Confirmación de activar / desactivar, con el efecto explicado y el error
 * del backend (p. ej. "es el único Administrador activo").
 */
export function ConfirmarActivo({
  objetivo,
  entidad,
  efectoDesactivar,
  onConfirm,
  onClose,
  isLoading,
  error,
}: {
  objetivo: { nombre: string; activo: boolean | null | undefined } | null;
  /** "el cliente", "la categoría"… */
  entidad: string;
  /** Qué deja de poder hacerse con el registro inactivo. */
  efectoDesactivar: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
}) {
  const desactivar = objetivo?.activo !== false;
  const titulo = `${desactivar ? 'Desactivar' : 'Activar'} ${entidad.replace(/^(el|la) /, '')}`;
  return (
    <Modal open={!!objetivo} onClose={onClose} title={titulo.charAt(0).toUpperCase() + titulo.slice(1)}>
      <div className="space-y-4">
        <p className="text-sm text-graphite-600">
          {desactivar ? (
            <>
              ¿Desactivar {entidad} <strong>{objetivo?.nombre}</strong>? {efectoDesactivar} No se borra nada: conserva su
              historial y puedes volver a activarlo cuando quieras.
            </>
          ) : (
            <>
              ¿Activar {entidad} <strong>{objetivo?.nombre}</strong>? Volverá a estar disponible en todo el sistema.
            </>
          )}
        </p>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-graphite-600 hover:bg-graphite-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
              desactivar ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isLoading ? 'Guardando…' : desactivar ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
