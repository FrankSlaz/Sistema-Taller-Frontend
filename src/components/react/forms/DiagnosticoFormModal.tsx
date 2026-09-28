import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import OrdenSelect from './OrdenSelect';
import { useDiagnosticoMutations } from '../../../lib/hooks/useDiagnosticos';
import { ApiError } from '../../../lib/api/client';
import type { Diagnostico } from '../../../types/diagnostico';

interface DiagnosticoFormModalProps {
  open: boolean;
  onClose: () => void;
  diagnostico?: Diagnostico | null;
  /** Si se provee, la orden queda fija (ej. desde el detalle de una orden). */
  defaultOrdenId?: number;
  defaultOrdenLabel?: string;
}

interface FormState {
  ordenId: number;
  fallaDetectada: string;
  diagnostico: string;
  solucionPropuesta: string;
  observaciones: string;
}

const emptyForm: FormState = {
  ordenId: 0,
  fallaDetectada: '',
  diagnostico: '',
  solucionPropuesta: '',
  observaciones: '',
};

export default function DiagnosticoFormModal({
  open,
  onClose,
  diagnostico,
  defaultOrdenId,
  defaultOrdenLabel,
}: DiagnosticoFormModalProps) {
  const isEdit = !!diagnostico;
  const { create, update } = useDiagnosticoMutations(defaultOrdenId ?? diagnostico?.ordenId);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [ordenLabel, setOrdenLabel] = useState('');
  const [touched, setTouched] = useState(false);

  const mutation = isEdit ? update : create;

  useEffect(() => {
    if (!open) return;

    if (diagnostico) {
      setForm({
        ordenId: diagnostico.ordenId,
        fallaDetectada: diagnostico.fallaDetectada ?? '',
        diagnostico: diagnostico.diagnostico ?? '',
        solucionPropuesta: diagnostico.solucionPropuesta ?? '',
        observaciones: diagnostico.observaciones ?? '',
      });
      setOrdenLabel(diagnostico.orden?.codigoOrden ?? '');
    } else {
      setForm({ ...emptyForm, ordenId: defaultOrdenId ?? 0 });
      setOrdenLabel(defaultOrdenLabel ?? '');
    }

    setTouched(false);
    mutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, diagnostico]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!form.ordenId) return;

    const payload = {
      fallaDetectada: form.fallaDetectada || undefined,
      diagnostico: form.diagnostico || undefined,
      solucionPropuesta: form.solucionPropuesta || undefined,
      observaciones: form.observaciones || undefined,
    };

    if (isEdit && diagnostico) {
      update.mutate({ id: diagnostico.id, payload }, { onSuccess: onClose });
    } else {
      create.mutate({ ordenId: form.ordenId, ...payload }, { onSuccess: onClose });
    }
  }

  const errorMessage =
    mutation.error instanceof ApiError ? mutation.error.message : mutation.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar diagnóstico' : 'Nuevo diagnóstico'}>
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
          <label className="mb-1 block text-sm font-medium text-graphite-900">Falla detectada</label>
          <textarea
            rows={2}
            value={form.fallaDetectada}
            onChange={(e) => set('fallaDetectada', e.target.value)}
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Diagnóstico</label>
          <textarea
            rows={2}
            value={form.diagnostico}
            onChange={(e) => set('diagnostico', e.target.value)}
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Solución propuesta</label>
          <textarea
            rows={2}
            value={form.solucionPropuesta}
            onChange={(e) => set('solucionPropuesta', e.target.value)}
            className="w-full resize-none rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
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
            {mutation.isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Registrar diagnóstico'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
