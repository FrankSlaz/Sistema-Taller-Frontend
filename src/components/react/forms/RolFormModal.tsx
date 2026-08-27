import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import { useRolMutations } from '../../../lib/hooks/useRoles';
import { ApiError } from '../../../lib/api/client';
import type { RolConConteo, RolPayload } from '../../../types/rol';

interface RolFormModalProps {
  open: boolean;
  onClose: () => void;
  rol?: RolConConteo | null;
}

const emptyForm: RolPayload = { nombre: '', descripcion: '' };

export default function RolFormModal({ open, onClose, rol }: RolFormModalProps) {
  const isEdit = !!rol;
  const { create, update } = useRolMutations();
  const [form, setForm] = useState<RolPayload>(emptyForm);

  const mutation = isEdit ? update : create;

  useEffect(() => {
    if (!open) return;
    setForm(rol ? { nombre: rol.nombre, descripcion: rol.descripcion ?? '' } : emptyForm);
    mutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rol]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.nombre.trim()) return;

    const payload = { ...form, descripcion: form.descripcion || undefined };

    if (isEdit && rol) {
      update.mutate({ id: rol.id, payload }, { onSuccess: onClose });
    } else {
      create.mutate(payload, { onSuccess: onClose });
    }
  }

  const errorMessage =
    mutation.error instanceof ApiError ? mutation.error.message : mutation.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar rol' : 'Nuevo rol'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={50}
            value={form.nombre}
            onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Descripción</label>
          <textarea
            rows={2}
            maxLength={200}
            value={form.descripcion}
            onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
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
            {mutation.isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear rol'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
