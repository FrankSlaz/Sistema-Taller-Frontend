import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

/**
 * Input de búsqueda reutilizable para filtros de listados.
 * Debounce interno para no disparar una petición por cada tecla.
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar…',
  debounceMs = 400,
}: SearchInputProps) {
  const [internal, setInternal] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (internal !== value) onChange(internal);
    }, debounceMs);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internal]);

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite-400" />
      <input
        type="text"
        value={internal}
        onChange={(e) => setInternal(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-graphite-200 py-2 pl-9 pr-3 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800 sm:w-72"
      />
    </div>
  );
}
