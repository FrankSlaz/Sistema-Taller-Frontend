import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils/cn';
import TarjetasMovil from './TarjetasMovil';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  getRowId: (row: T) => string | number;
  /** Filas de esqueleto mientras carga la primera vez (mismo alto que las reales). */
  filasCarga?: number;
}

/**
 * Tabla dinámica genérica. Sirve como base para los listados de
 * órdenes, clientes, inventario, etc. Cada módulo la usa pasando
 * sus columnas y su fuente de datos (useQuery hacia el backend).
 */
export default function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No hay registros para mostrar.',
  getRowId,
  filasCarga = 5,
}: DataTableProps<T>) {
  // Primera carga: esqueleto con el alto de las filas reales (la página no
  // salta al llegar los datos). Al volver a cargar (filtro, página) se
  // mantienen las filas actuales atenuadas en vez de vaciar la tabla.
  const primeraCarga = !!isLoading && data.length === 0;
  const recargando = !!isLoading && data.length > 0;
  const valor = (col: Column<T>, row: T) =>
    col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '');
  return (
    <>
      {/* Celular: cada fila como tarjeta (sin desplazarse de costado). */}
      <div className="sm:hidden">
        <TarjetasMovil
          columnas={columns.map((c) => ({ clave: c.key, titulo: c.header, render: (r: T) => valor(c, r) }))}
          filas={data}
          clave={(r) => getRowId(r)}
          cargando={primeraCarga}
          recargando={recargando}
          vacio={emptyMessage}
        />
      </div>
    <div className="hidden overflow-x-auto rounded-lg border border-graphite-200 sm:block">
      <table className="min-w-full divide-y divide-graphite-200 text-sm">
        <thead className="bg-graphite-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-graphite-400"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-graphite-100 bg-white">
          {primeraCarga &&
            Array.from({ length: filasCarga }, (_, i) => (
              <tr key={`carga-${i}`} aria-hidden>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-5 animate-pulse rounded bg-graphite-100" />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-graphite-400">
                {emptyMessage}
              </td>
            </tr>
          )}

          {!primeraCarga &&
            data.map((row) => (
              <tr key={getRowId(row)} className={cn('hover:bg-graphite-50', recargando && 'opacity-60')}>
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 text-graphite-700', col.className)}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
    </>
  );
}
