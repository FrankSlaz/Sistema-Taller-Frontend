import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return <p className="text-xs text-graphite-400">{total} registro{total === 1 ? '' : 's'}</p>;
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <p className="text-xs text-graphite-400">
        Página {page} de {totalPages} · {total} registros
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-graphite-200 text-graphite-600 hover:bg-graphite-50 disabled:opacity-40"
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-graphite-200 text-graphite-600 hover:bg-graphite-50 disabled:opacity-40"
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
