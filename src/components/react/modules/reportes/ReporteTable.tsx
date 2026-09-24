import type { ReactNode } from 'react';

export interface ReporteColumn<T> {
  key: keyof T;
  header: string;
  align?: 'left' | 'right';
  render?: (row: T) => ReactNode;
}

interface ReporteTableProps<T> {
  columns: ReporteColumn<T>[];
  rows: T[];
  emptyMessage?: string;
}

export default function ReporteTable<T>({
  columns,
  rows,
  emptyMessage = 'Sin datos para los filtros seleccionados.',
}: ReporteTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-graphite-200">
      <table className="min-w-full divide-y divide-graphite-200 text-sm">
        <thead className="bg-graphite-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-graphite-400 ${
                  col.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-graphite-100 bg-white">
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-graphite-400">
                {emptyMessage}
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-graphite-50">
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`px-4 py-3 text-graphite-700 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
