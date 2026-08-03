import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import ClienteSelect from './ClienteSelect';
import EquipoSelect from './EquipoSelect';
import { useReparacionMutations } from '../../../lib/hooks/useReparaciones';
import { ApiError } from '../../../lib/api/client';
import { PRIORIDADES, type CreateOrdenPayload } from '../../../types/reparacion';

interface ReparacionFormModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (ordenId: number) => void;
  defaultClienteId?: number;
  defaultClienteNombre?: string;
  defaultEquipoId?: number;
  defaultEquipoLabel?: string;
}

const emptyForm: CreateOrdenPayload = {
  clienteId: 0,
  equipoId: 0,
  prioridad: 'NORMAL',
  fechaEstimadaEntrega: '',
  fechaPromesa: '',
  fallaReportada: '',
  observaciones: '',
};

export default function ReparacionFormModal({
  open,
  onClose,
  onCreated,
  defaultClienteId,
  defaultClienteNombre,
  defaultEquipoId,
  defaultEquipoLabel,
}: ReparacionFormModalProps) {
  const { create } = useReparacionMutations();
  const [form, setForm] = useState<CreateOrdenPayload>(emptyForm);
  const [clienteLabel, setClienteLabel] = useState('');
  const [equipoLabel, setEquipoLabel] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...emptyForm,
      clienteId: defaultClienteId ?? 0,
      equipoId: defaultEquipoId ?? 0,
    });
    setClienteLabel(defaultClienteNombre ?? '');
    setEquipoLabel(defaultEquipoLabel ?? '');
    setTouched(false);
    create.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof CreateOrdenPayload>(key: K, value: CreateOrdenPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleClienteChange(clienteId: number, nombre: string) {
    set('clienteId', clienteId);
    set('equipoId', 0); // el equipo previamente elegido puede no pertenecer al nuevo cliente
    setClienteLabel(nombre);
    setEquipoLabel('');
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);

    if (!form.clienteId || !form.equipoId || !form.fallaReportada.trim()) return;

    const payload: CreateOrdenPayload = {
      ...form,
      fechaEstimadaEntrega: form.fechaEstimadaEntrega || undefined,
      fechaPromesa: form.fechaPromesa || undefined,
      observaciones: form.observaciones || undefined,
    };

    create.mutate(payload, {
      onSuccess: (orden) => {
        onClose();
        onCreated?.(orden.id);
      },
    });
  }

  const errorMessage =
    create.error instanceof ApiError ? create.error.message : create.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title="Nueva orden de reparación">
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Cliente <span className="text-red-500">*</span>
          </label>
          <ClienteSelect
            value={form.clienteId || null}
            initialLabel={clienteLabel}
            onChange={handleClienteChange}
            error={touched && !form.clienteId ? 'Selecciona un cliente' : undefined}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Equipo <span className="text-red-500">*</span>
          </label>
          <EquipoSelect
            clienteId={form.clienteId || null}
            value={form.equipoId || null}
            initialLabel={equipoLabel}
            onChange={(id, label) => {
              set('equipoId', id);
              setEquipoLabel(label);
            }}
            error={touched && !form.equipoId ? 'Selecciona un equipo' : undefined}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Falla reportada por el cliente <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={form.fallaReportada}
            onChange={(e) => set('fallaReportada', e.target.value)}
            placeholder="Ej. El equipo no enciende, la pantalla parpadea…"
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Prioridad</label>
            <select
              value={form.prioridad}
              onChange={(e) => set('prioridad', e.target.value as CreateOrdenPayload['prioridad'])}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            >
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Fecha promesa</label>
            <input
              type="date"
              value={form.fechaPromesa}
              onChange={(e) => set('fechaPromesa', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Entrega estimada</label>
            <input
              type="date"
              value={form.fechaEstimadaEntrega}
              onChange={(e) => set('fechaEstimadaEntrega', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Observaciones</label>
          <textarea
            rows={2}
            value={form.observaciones}
            onChange={(e) => set('observaciones', e.target.value)}
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
        )}

        <div className="sticky bottom-0 flex justify-end gap-2 bg-white pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-graphite-600 hover:bg-graphite-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={create.isPending}
            className="rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
          >
            {create.isPending ? 'Creando…' : 'Crear orden'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
