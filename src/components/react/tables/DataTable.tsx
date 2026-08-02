import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils/cn';

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
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-graphite-200">
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
          {isLoading && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-graphite-400">
                Cargando…
              </td>
            </tr>
          )}

          {!isLoading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-graphite-400">
                {emptyMessage}
              </td>
            </tr>
          )}

          {!isLoading &&
            data.map((row) => (
              <tr key={getRowId(row)} className="hover:bg-graphite-50">
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
  );
}
