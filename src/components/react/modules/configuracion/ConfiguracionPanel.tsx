import { Save } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import QueryProvider from '../../providers/QueryProvider';
import { useConfiguracion, useUpdateConfiguracion } from '../../../../lib/hooks/useConfiguracion';
import { useAuth } from '../../../../lib/hooks/useAuth';
import { ApiError } from '../../../../lib/api/client';
import type { UpdateConfiguracionPayload } from '../../../../types/configuracion';

interface FormState {
  nombreTaller: string;
  telefono: string;
  email: string;
  direccion: string;
  moneda: string;
  simbolo: string;
  mensajeDocumentos: string;
}

const emptyForm: FormState = {
  nombreTaller: '',
  telefono: '',
  email: '',
  direccion: '',
  moneda: '',
  simbolo: '',
  mensajeDocumentos: '',
};

function ConfiguracionPanelContent() {
  const { data: config, isLoading } = useConfiguracion();
  const { rolNombre } = useAuth();
  const mutation = useUpdateConfiguracion();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const esAdmin = rolNombre === 'Administrador';

  useEffect(() => {
    if (!config) return;
    setForm({
      nombreTaller: config.nombreTaller ?? '',
      telefono: config.telefono ?? '',
      email: config.email ?? '',
      direccion: config.direccion ?? '',
      moneda: config.moneda ?? '',
      simbolo: config.simbolo ?? '',
      mensajeDocumentos: config.mensajeDocumentos ?? '',
    });
  }, [config]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!esAdmin) return;

    const payload: UpdateConfiguracionPayload = {
      nombreTaller: form.nombreTaller || undefined,
      telefono: form.telefono || undefined,
      email: form.email || undefined,
      direccion: form.direccion || undefined,
      moneda: form.moneda || undefined,
      simbolo: form.simbolo || undefined,
      mensajeDocumentos: form.mensajeDocumentos || undefined,
    };

    mutation.mutate(payload, { onSuccess: () => setSavedAt(Date.now()) });
  }

  const errorMessage =
    mutation.error instanceof ApiError ? mutation.error.message : mutation.error ? 'Error inesperado' : null;

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-lg bg-graphite-100" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!esAdmin && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Podés ver la configuración actual, pero solo un Administrador puede modificarla.
        </p>
      )}

      <fieldset disabled={!esAdmin} className="space-y-4 disabled:opacity-70">
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Nombre del taller</label>
          <input
            type="text"
            maxLength={150}
            value={form.nombreTaller}
            onChange={(e) => set('nombreTaller', e.target.value)}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800 disabled:bg-graphite-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Teléfono</label>
            <input
              type="tel"
              maxLength={30}
              value={form.telefono}
              onChange={(e) => set('telefono', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800 disabled:bg-graphite-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Email</label>
            <input
              type="email"
              maxLength={120}
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800 disabled:bg-graphite-50"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Dirección</label>
          <input
            type="text"
            maxLength={250}
            value={form.direccion}
            onChange={(e) => set('direccion', e.target.value)}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800 disabled:bg-graphite-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Moneda</label>
            <input
              type="text"
              maxLength={10}
              placeholder="BOB"
              value={form.moneda}
              onChange={(e) => set('moneda', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800 disabled:bg-graphite-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Símbolo</label>
            <input
              type="text"
              maxLength={10}
              placeholder="Bs"
              value={form.simbolo}
              onChange={(e) => set('simbolo', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800 disabled:bg-graphite-50"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Mensaje en documentos
          </label>
          <textarea
            rows={3}
            value={form.mensajeDocumentos}
            onChange={(e) => set('mensajeDocumentos', e.target.value)}
            placeholder="Ej. Gracias por confiar en nosotros. Garantía sujeta a términos y condiciones…"
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800 disabled:bg-graphite-50"
          />
          <p className="mt-1 text-xs text-graphite-400">
            Texto que se imprime al pie de órdenes, presupuestos y otros documentos generados.
          </p>
        </div>
      </fieldset>

      {errorMessage && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}
      {savedAt && !errorMessage && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">Configuración guardada.</p>
      )}

      {esAdmin && (
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
        >
          <Save size={15} />
          {mutation.isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      )}
    </form>
  );
}

export default function ConfiguracionPanel() {
  return (
    <QueryProvider>
      <ConfiguracionPanelContent />
    </QueryProvider>
  );
}
