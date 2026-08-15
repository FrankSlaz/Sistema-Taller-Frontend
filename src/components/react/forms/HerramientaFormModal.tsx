import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import { useHerramientaMutations } from '../../../lib/hooks/useHerramientas';
import { ApiError } from '../../../lib/api/client';
import type { CreateHerramientaPayload, Herramienta } from '../../../types/herramienta';

interface HerramientaFormModalProps {
  open: boolean;
  onClose: () => void;
  herramienta?: Herramienta | null;
}

const emptyForm: CreateHerramientaPayload = {
  nombre: '',
  marca: '',
  modelo: '',
  numeroSerie: '',
  fechaCompra: '',
  costo: 0,
  observaciones: '',
};

export default function HerramientaFormModal({ open, onClose, herramienta }: HerramientaFormModalProps) {
  const isEdit = !!herramienta;
  const { create, update } = useHerramientaMutations(herramienta?.id);
  const [form, setForm] = useState<CreateHerramientaPayload>(emptyForm);

  const mutation = isEdit ? update : create;

  useEffect(() => {
    if (!open) return;
    setForm(
      herramienta
        ? {
            nombre: herramienta.nombre,
            marca: herramienta.marca ?? '',
            modelo: herramienta.modelo ?? '',
            numeroSerie: herramienta.numeroSerie ?? '',
            fechaCompra: herramienta.fechaCompra ? herramienta.fechaCompra.slice(0, 10) : '',
            costo: Number(herramienta.costo ?? 0),
            observaciones: herramienta.observaciones ?? '',
          }
        : emptyForm,
    );
    mutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, herramienta]);

  function set<K extends keyof CreateHerramientaPayload>(key: K, value: CreateHerramientaPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.nombre.trim()) return;

    const payload: CreateHerramientaPayload = {
      ...form,
      marca: form.marca || undefined,
      modelo: form.modelo || undefined,
      numeroSerie: form.numeroSerie || undefined,
      fechaCompra: form.fechaCompra || undefined,
      observaciones: form.observaciones || undefined,
    };

    if (isEdit && herramienta) {
      update.mutate(payload, { onSuccess: onClose });
    } else {
      create.mutate(payload, { onSuccess: onClose });
    }
  }

  const errorMessage =
    mutation.error instanceof ApiError ? mutation.error.message : mutation.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar herramienta' : 'Nueva herramienta'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={150}
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Marca</label>
            <input
              type="text"
              value={form.marca}
              onChange={(e) => set('marca', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Modelo</label>
            <input
              type="text"
              value={form.modelo}
              onChange={(e) => set('modelo', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">N.º de serie</label>
            <input
              type="text"
              value={form.numeroSerie}
              onChange={(e) => set('numeroSerie', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Fecha de compra</label>
            <input
              type="date"
              value={form.fechaCompra}
              onChange={(e) => set('fechaCompra', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Costo</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.costo}
            onChange={(e) => set('costo', Number(e.target.value))}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
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
            {mutation.isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear herramienta'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
