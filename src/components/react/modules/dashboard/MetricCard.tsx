interface MetricCardProps {
  label: string;
  value: number | string | undefined;
  isLoading?: boolean;
  hint?: string;
  tone?: 'default' | 'amber' | 'green' | 'red';
}

const TONE_CLASSES: Record<NonNullable<MetricCardProps['tone']>, string> = {
  default: 'text-graphite-900',
  amber: 'text-amber-700',
  green: 'text-green-700',
  red: 'text-red-700',
};

export default function MetricCard({ label, value, isLoading, hint, tone = 'default' }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-graphite-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-graphite-500">{label}</p>
      {isLoading ? (
        <div className="mt-2 h-8 w-16 animate-pulse rounded bg-graphite-100" />
      ) : (
        <p className={`font-display text-3xl font-semibold ${TONE_CLASSES[tone]}`}>{value ?? '—'}</p>
      )}
      {hint && <p className="mt-1 text-xs text-graphite-400">{hint}</p>}
    </div>
  );
}
