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
  garantiaDiasDefault: number;
  garantiaCondiciones: string;
}

const emptyForm: FormState = {
  nombreTaller: '',
  telefono: '',
  email: '',
  direccion: '',
  moneda: '',
  simbolo: '',
  garantiaDiasDefault: 30,
  garantiaCondiciones: '',
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
      garantiaDiasDefault: config.garantiaDiasDefault ?? 30,
      garantiaCondiciones: config.garantiaCondiciones ?? '',
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
      garantiaDiasDefault: form.garantiaDiasDefault,
      garantiaCondiciones: form.garantiaCondiciones,
    };

    const cambioNombre = (config?.nombreTaller ?? '') !== form.nombreTaller;
    mutation.mutate(payload, {
      onSuccess: () => {
        // El nombre se pinta en el servidor (barra, título de la pestaña):
        // hay que recargar para verlo actualizado.
        if (cambioNombre) window.location.reload();
        else setSavedAt(Date.now());
      },
    });
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

        <div className="rounded-md border border-graphite-100 p-4">
          <p className="text-sm font-medium text-graphite-900">Garantía por defecto</p>
          <p className="mb-3 text-xs text-graphite-400">
            Valor inicial que ve el técnico al definir la garantía cuando termina la reparación.
          </p>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-graphite-900">Días</label>
              <input
                type="number"
                min={0}
                max={730}
                value={form.garantiaDiasDefault}
                onChange={(e) => set('garantiaDiasDefault', Math.max(0, Math.trunc(Number(e.target.value))))}
                className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800 disabled:bg-graphite-50"
              />
              <p className="mt-1 text-xs text-graphite-400">0 = sin garantía</p>
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1 block text-sm font-medium text-graphite-900">Condiciones</label>
              <textarea
                rows={3}
                value={form.garantiaCondiciones}
                onChange={(e) => set('garantiaCondiciones', e.target.value)}
                placeholder="Ej. Cubre la reparación realizada y los repuestos instalados. No cubre golpes, humedad ni manipulación por terceros."
                className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800 disabled:bg-graphite-50"
              />
              <p className="mt-1 text-xs text-graphite-400">Se imprimen en el acta de entrega.</p>
            </div>
          </div>
        </div>

        {/* Solo informativo: el correo se configura en el servidor (variables MAIL_*). */}
        <div className="rounded-md border border-graphite-100 p-4">
          <p className="text-sm font-medium text-graphite-900">Recuperación de contraseñas</p>
          {config?.correoRecuperacion ? (
            <p className="mt-1 text-xs text-graphite-500">
              <span className="font-semibold text-green-700">Por correo.</span> Quien olvida su contraseña recibe un enlace
              para crear una nueva (vence en 30 minutos).
            </p>
          ) : (
            <p className="mt-1 text-xs text-graphite-500">
              <span className="font-semibold text-amber-700">Por el administrador.</span> No hay correo configurado: las
              solicitudes aparecen en tu inicio y en Usuarios, donde asignas una contraseña temporal. Para activar el envío
              por correo, configura las variables <code className="rounded bg-graphite-100 px-1">MAIL_*</code> del servidor
              (ver <code className="rounded bg-graphite-100 px-1">.env.example</code>).
            </p>
          )}
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
