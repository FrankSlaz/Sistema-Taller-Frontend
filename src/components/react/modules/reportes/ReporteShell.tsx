import { Download, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { ApiError } from '../../../../lib/api/client';

interface ResumenItem {
  label: string;
  value: string;
}

interface ReporteShellProps {
  descripcion?: string;
  filtros?: ReactNode;
  resumen?: ResumenItem[];
  onDescargarPdf: () => void;
  isPdfPending: boolean;
  pdfError?: unknown;
  isLoading?: boolean;
  children: ReactNode;
}

export default function ReporteShell({
  descripcion,
  filtros,
  resumen,
  onDescargarPdf,
  isPdfPending,
  pdfError,
  isLoading,
  children,
}: ReporteShellProps) {
  const errorMessage = pdfError instanceof ApiError ? pdfError.message : pdfError ? 'Error inesperado' : null;

  return (
    <div className="space-y-4">
      {descripcion && <p className="text-sm text-graphite-500">{descripcion}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {filtros && <div className="flex flex-wrap items-end gap-3">{filtros}</div>}

        <button
          type="button"
          onClick={onDescargarPdf}
          disabled={isPdfPending}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-graphite-200 px-4 py-2 text-sm font-medium text-graphite-700 hover:bg-graphite-50 disabled:opacity-60"
        >
          {isPdfPending ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {isPdfPending ? 'Generando…' : 'Descargar PDF'}
        </button>
      </div>

      {errorMessage && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}

      {resumen && resumen.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {resumen.map((item) => (
            <div key={item.label} className="rounded-md bg-graphite-50 px-3 py-2">
              <p className="text-xs text-graphite-400">{item.label}</p>
              <p className="font-display text-lg font-semibold text-graphite-900">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {isLoading ? <div className="h-48 animate-pulse rounded-lg bg-graphite-100" /> : children}
    </div>
  );
}
