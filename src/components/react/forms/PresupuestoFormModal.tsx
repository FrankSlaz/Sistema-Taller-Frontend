import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import OrdenSelect from './OrdenSelect';
import { usePresupuestoMutations } from '../../../lib/hooks/usePresupuestos';
import { ApiError } from '../../../lib/api/client';
import type { Presupuesto } from '../../../types/presupuesto';

interface PresupuestoFormModalProps {
  open: boolean;
  onClose: () => void;
  presupuesto?: Presupuesto | null;
  /** Si se provee, la orden queda fija (ej. desde el detalle de una orden). */
  defaultOrdenId?: number;
  defaultOrdenLabel?: string;
}

interface FormState {
  ordenId: number;
  descripcion: string;
  costoRepuestos: number;
  costoManoObra: number;
}

const emptyForm: FormState = { ordenId: 0, descripcion: '', costoRepuestos: 0, costoManoObra: 0 };

export default function PresupuestoFormModal({
  open,
  onClose,
  presupuesto,
  defaultOrdenId,
  defaultOrdenLabel,
}: PresupuestoFormModalProps) {
  const isEdit = !!presupuesto;
  const { create, update } = usePresupuestoMutations(defaultOrdenId ?? presupuesto?.ordenId);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [ordenLabel, setOrdenLabel] = useState('');
  const [touched, setTouched] = useState(false);

  const mutation = isEdit ? update : create;

  useEffect(() => {
    if (!open) return;

    if (presupuesto) {
      setForm({
        ordenId: presupuesto.ordenId,
        descripcion: presupuesto.descripcion ?? '',
        costoRepuestos: Number(presupuesto.costoRepuestos ?? 0),
        costoManoObra: Number(presupuesto.costoManoObra ?? 0),
      });
      setOrdenLabel(presupuesto.orden?.codigoOrden ?? '');
    } else {
      setForm({ ...emptyForm, ordenId: defaultOrdenId ?? 0 });
      setOrdenLabel(defaultOrdenLabel ?? '');
    }

    setTouched(false);
    mutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, presupuesto]);

  const total = useMemo(
    () => (form.costoRepuestos || 0) + (form.costoManoObra || 0),
    [form.costoRepuestos, form.costoManoObra],
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);

    if (!form.ordenId) return;

    const payload = {
      descripcion: form.descripcion || undefined,
      costoRepuestos: form.costoRepuestos,
      costoManoObra: form.costoManoObra,
    };

    if (isEdit && presupuesto) {
      update.mutate({ id: presupuesto.id, payload }, { onSuccess: onClose });
    } else {
      create.mutate({ ordenId: form.ordenId, ...payload }, { onSuccess: onClose });
    }
  }

  const errorMessage =
    mutation.error instanceof ApiError ? mutation.error.message : mutation.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar presupuesto' : 'Nuevo presupuesto'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isEdit || defaultOrdenId ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Orden</label>
            <p className="rounded-md border border-graphite-100 bg-graphite-50 px-3 py-2 text-sm text-graphite-600">
              {ordenLabel || `Orden #${form.ordenId}`}
            </p>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">
              Orden <span className="text-red-500">*</span>
            </label>
            <OrdenSelect
              value={form.ordenId || null}
              initialLabel={ordenLabel}
              onChange={(id, label) => {
                set('ordenId', id);
                setOrdenLabel(label);
              }}
              error={touched && !form.ordenId ? 'Selecciona una orden' : undefined}
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Descripción</label>
          <textarea
            rows={2}
            value={form.descripcion}
            onChange={(e) => set('descripcion', e.target.value)}
            placeholder="Ej. Cambio de pantalla + mano de obra…"
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Costo de repuestos</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.costoRepuestos}
              onChange={(e) => set('costoRepuestos', Number(e.target.value))}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Costo de mano de obra</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.costoManoObra}
              onChange={(e) => set('costoManoObra', Number(e.target.value))}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div className="rounded-md bg-graphite-50 px-3 py-2 text-right text-sm">
          <span className="text-graphite-500">Total estimado: </span>
          <span className="font-semibold text-graphite-900">Bs {total.toFixed(2)}</span>
        </div>

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-graphite-600 hover:bg-graphite-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
          >
            {mutation.isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear presupuesto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
