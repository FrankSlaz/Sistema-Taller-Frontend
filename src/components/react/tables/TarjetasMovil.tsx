import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils/cn';

/**
 * Vista de celular de una tabla: cada fila es una tarjeta. La primera
 * columna con título es el encabezado de la tarjeta, el resto va en dos
 * columnas "título: valor" y las columnas sin título (acciones) al pie.
 * Una columna sin título al principio (p. ej. la foto) va a la izquierda
 * del encabezado.
 */
export interface ColumnaMovil<T> {
  clave: string;
  titulo: string;
  render: (fila: T) => ReactNode;
}

export default function TarjetasMovil<T>({
  columnas,
  filas,
  clave,
  cargando,
  recargando,
  vacio,
  filasCarga = 4,
  tono,
  pie,
}: {
  columnas: ColumnaMovil<T>[];
  filas: T[];
  clave: (fila: T, i: number) => string | number;
  cargando?: boolean;
  recargando?: boolean;
  vacio: ReactNode;
  filasCarga?: number;
  /** Clases de color de la tarjeta (alertas). */
  tono?: (fila: T) => string | undefined;
  /** Contenido extra al final (p. ej. totales). */
  pie?: ReactNode;
}) {
  const media = columnas[0] && !columnas[0].titulo ? columnas[0] : null;
  const resto = media ? columnas.slice(1) : columnas;
  const indiceTitulo = resto.findIndex((c) => c.titulo);
  const principal = indiceTitulo >= 0 ? resto[indiceTitulo] : null;
  const datos = resto.filter((c, i) => c.titulo && i !== indiceTitulo);
  const acciones = resto.filter((c) => !c.titulo);

  if (cargando) {
    return (
      <div className="space-y-2" aria-hidden>
        {Array.from({ length: filasCarga }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-graphite-100" />
        ))}
      </div>
    );
  }
  if (!filas.length) {
    return <p className="rounded-lg border border-graphite-200 px-4 py-6 text-center text-sm text-graphite-400">{vacio}</p>;
  }

  return (
    <ul className={cn('space-y-2', recargando && 'opacity-60')}>
      {filas.map((f, i) => (
        <li key={clave(f, i)} className={cn('rounded-lg border border-graphite-200 bg-white p-3 text-sm', tono?.(f))}>
          <div className="flex items-start gap-3">
            {media && <div className="shrink-0">{media.render(f)}</div>}
            {principal && <div className="min-w-0 flex-1 break-words font-medium text-graphite-900">{principal.render(f)}</div>}
          </div>
          {datos.length > 0 && (
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
              {datos.map((c) => (
                <div key={c.clave} className="min-w-0">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-graphite-400">{c.titulo}</dt>
                  <dd className="break-words text-graphite-700">{c.render(f)}</dd>
                </div>
              ))}
            </dl>
          )}
          {acciones.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center justify-end gap-1 border-t border-graphite-100 pt-2">
              {acciones.map((c) => (
                <div key={c.clave}>{c.render(f)}</div>
              ))}
            </div>
          )}
        </li>
      ))}
      {pie && <li>{pie}</li>}
    </ul>
  );
}
