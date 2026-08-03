import { useQuery } from '@tanstack/react-query';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { reparacionesApi } from '../../../lib/api/reparaciones';

interface OrdenSelectProps {
  value: number | null;
  onChange: (ordenId: number, label: string) => void;
  initialLabel?: string | null;
  error?: string;
}

/**
 * Combobox de Orden de reparación: busca por código o cliente contra
 * /reparaciones. Se usa al crear un presupuesto desde la vista global
 * (fuera del contexto de una orden ya abierta).
 */
export default function OrdenSelect({ value, onChange, initialLabel, error }: OrdenSelectProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [selectedLabel, setSelectedLabel] = useState(initialLabel ?? '');
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isFetching } = useQuery({
    queryKey: ['ordenes-select', term],
    queryFn: () => reparacionesApi.findAll({ search: term, limit: 8 }),
    enabled: open,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedLabel(initialLabel ?? '');
  }, [initialLabel]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm focus:outline-none focus:ring-1 ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-graphite-200 focus:border-graphite-800 focus:ring-graphite-800'
        }`}
      >
        <span className={value ? 'text-graphite-900' : 'text-graphite-400'}>
          {value ? selectedLabel || `Orden #${value}` : 'Seleccionar orden…'}
        </span>
        <ChevronDown size={16} className="text-graphite-400" />
      </button>

      {open && (
        <div className="absolute z-40 mt-1 w-full rounded-md border border-graphite-200 bg-white shadow-lg">
          <div className="relative border-b border-graphite-100 p-2">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-graphite-400" />
            <input
              autoFocus
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar por código de orden o falla…"
              className="w-full rounded-md py-1.5 pl-7 pr-2 text-sm focus:outline-none"
            />
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {isFetching && <li className="px-3 py-2 text-sm text-graphite-400">Buscando…</li>}

            {!isFetching && (data?.items.length ?? 0) === 0 && (
              <li className="px-3 py-2 text-sm text-graphite-400">Sin resultados.</li>
            )}

            {!isFetching &&
              data?.items.map((orden) => {
                const label = `${orden.codigoOrden} · ${orden.cliente.nombre}`;
                return (
                  <li key={orden.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(orden.id, label);
                        setSelectedLabel(label);
                        setOpen(false);
                        setTerm('');
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-graphite-50"
                    >
                      <span>{label}</span>
                      {orden.id === value && <Check size={14} className="text-graphite-900" />}
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
