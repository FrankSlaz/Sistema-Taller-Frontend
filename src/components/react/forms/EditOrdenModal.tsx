import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import { useReparacionMutations } from '../../../lib/hooks/useReparaciones';
import { ApiError } from '../../../lib/api/client';
import { PRIORIDADES, type OrdenReparacion, type UpdateOrdenPayload } from '../../../types/reparacion';

interface EditOrdenModalProps {
  open: boolean;
  onClose: () => void;
  orden: OrdenReparacion;
}

function toDateInput(value?: string | null) {
  if (!value) return '';
  return value.slice(0, 10);
}

export default function EditOrdenModal({ open, onClose, orden }: EditOrdenModalProps) {
  const { update } = useReparacionMutations(orden.id);
  const [form, setForm] = useState<UpdateOrdenPayload>({});

  useEffect(() => {
    if (!open) return;
    setForm({
      prioridad: (orden.prioridad as UpdateOrdenPayload['prioridad']) ?? 'NORMAL',
      fechaPromesa: toDateInput(orden.fechaPromesa),
      fechaEstimadaEntrega: toDateInput(orden.fechaEstimadaEntrega),
      fallaReportada: orden.fallaReportada ?? '',
      observaciones: orden.observaciones ?? '',
      costoManoObra: orden.costoManoObra ? Number(orden.costoManoObra) : 0,
      totalRepuestos: orden.totalRepuestos ? Number(orden.totalRepuestos) : 0,
    });
    update.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orden]);

  function set<K extends keyof UpdateOrdenPayload>(key: K, value: UpdateOrdenPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    update.mutate(
      {
        ...form,
        fechaPromesa: form.fechaPromesa || undefined,
        fechaEstimadaEntrega: form.fechaEstimadaEntrega || undefined,
        observaciones: form.observaciones || undefined,
      },
      { onSuccess: onClose },
    );
  }

  const errorMessage =
    update.error instanceof ApiError ? update.error.message : update.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title={`Editar orden ${orden.codigoOrden}`}>
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Falla reportada</label>
          <textarea
            rows={3}
            value={form.fallaReportada ?? ''}
            onChange={(e) => set('fallaReportada', e.target.value)}
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Prioridad</label>
            <select
              value={form.prioridad}
              onChange={(e) => set('prioridad', e.target.value as UpdateOrdenPayload['prioridad'])}
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
              value={form.fechaPromesa ?? ''}
              onChange={(e) => set('fechaPromesa', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Entrega estimada</label>
            <input
              type="date"
              value={form.fechaEstimadaEntrega ?? ''}
              onChange={(e) => set('fechaEstimadaEntrega', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Costo mano de obra</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.costoManoObra ?? 0}
              onChange={(e) => set('costoManoObra', Number(e.target.value))}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Total repuestos</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.totalRepuestos ?? 0}
              onChange={(e) => set('totalRepuestos', Number(e.target.value))}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Observaciones</label>
          <textarea
            rows={2}
            value={form.observaciones ?? ''}
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
            disabled={update.isPending}
            className="rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
          >
            {update.isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
