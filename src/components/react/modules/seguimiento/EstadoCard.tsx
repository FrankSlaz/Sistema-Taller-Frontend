interface EstadoCardProps {
  label: string;
  cantidad: number | undefined;
  isLoading: boolean;
  active: boolean;
  onClick: () => void;
}

export default function EstadoCard({ label, cantidad, isLoading, active, onClick }: EstadoCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-4 text-left shadow-sm transition-colors ${
        active ? 'border-graphite-900 bg-graphite-900 text-white' : 'border-graphite-200 bg-white hover:bg-graphite-50'
      }`}
    >
      <p className={`text-xs font-medium ${active ? 'text-graphite-300' : 'text-graphite-500'}`}>{label}</p>
      {isLoading ? (
        <div className={`mt-1 h-7 w-10 animate-pulse rounded ${active ? 'bg-graphite-700' : 'bg-graphite-100'}`} />
      ) : (
        <p className="font-display text-2xl font-semibold">{cantidad ?? 0}</p>
      )}
    </button>
  );
}
