import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useUsuarios } from '../../../lib/hooks/useUsuarios';
import { ApiError } from '../../../lib/api/client';

interface UsuarioSelectProps {
  value: number | null;
  onChange: (usuarioId: number, label: string) => void;
  error?: string;
}

/**
 * Combobox de Usuario. GET /usuarios no admite búsqueda por query ni
 * paginación (además está restringido a rol Administrador), así que
 * trae la lista completa una vez y filtra en el cliente.
 */
export default function UsuarioSelect({ value, onChange, error }: UsuarioSelectProps) {
  const { data: usuarios, error: usuariosError } = useUsuarios();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtrados = useMemo(() => {
    if (!usuarios) return [];
    const q = term.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => `${u.nombre} ${u.apellido ?? ''}`.toLowerCase().includes(q));
  }, [usuarios, term]);

  const seleccionado = usuarios?.find((u) => u.id === value);
  const accessError = usuariosError instanceof ApiError ? usuariosError.message : null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={!!accessError}
        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-graphite-50 ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-graphite-200 focus:border-graphite-800 focus:ring-graphite-800'
        }`}
      >
        <span className={value ? 'text-graphite-900' : 'text-graphite-400'}>
          {seleccionado ? `${seleccionado.nombre} ${seleccionado.apellido ?? ''}` : 'Seleccionar usuario…'}
        </span>
        <ChevronDown size={16} className="text-graphite-400" />
      </button>

      {open && !accessError && (
        <div className="absolute z-40 mt-1 w-full rounded-md border border-graphite-200 bg-white shadow-lg">
          <div className="relative border-b border-graphite-100 p-2">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-graphite-400" />
            <input
              autoFocus
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar usuario…"
              className="w-full rounded-md py-1.5 pl-7 pr-2 text-sm focus:outline-none"
            />
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {filtrados.length === 0 && <li className="px-3 py-2 text-sm text-graphite-400">Sin resultados.</li>}
            {filtrados.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(u.id, `${u.nombre} ${u.apellido ?? ''}`.trim());
                    setOpen(false);
                    setTerm('');
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-graphite-50"
                >
                  <span>
                    {u.nombre} {u.apellido ?? ''}
                    <span className="ml-1 text-xs text-graphite-400">({u.rol?.nombre})</span>
                  </span>
                  {u.id === value && <Check size={14} className="text-graphite-900" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {accessError && <p className="mt-1 text-xs text-red-600">{accessError} (requiere rol Administrador)</p>}
      {error && !accessError && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
