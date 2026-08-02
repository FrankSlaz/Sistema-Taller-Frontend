import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import { useClienteMutations } from '../../../lib/hooks/useClientes';
import { ApiError } from '../../../lib/api/client';
import { TIPOS_DOCUMENTO, type Cliente, type ClientePayload } from '../../../types/cliente';

interface ClienteFormModalProps {
  open: boolean;
  onClose: () => void;
  cliente?: Cliente | null;
}

const emptyForm: ClientePayload = {
  tipoDocumento: '',
  numeroDocumento: '',
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  estado: true,
};

export default function ClienteFormModal({ open, onClose, cliente }: ClienteFormModalProps) {
  const isEdit = !!cliente;
  const { create, update } = useClienteMutations();
  const [form, setForm] = useState<ClientePayload>(emptyForm);
  const mutation = isEdit ? update : create;

  useEffect(() => {
    if (open) {
      setForm(
        cliente
          ? {
              tipoDocumento: cliente.tipoDocumento ?? '',
              numeroDocumento: cliente.numeroDocumento ?? '',
              nombre: cliente.nombre,
              telefono: cliente.telefono ?? '',
              email: cliente.email ?? '',
              direccion: cliente.direccion ?? '',
              estado: cliente.estado ?? true,
            }
          : emptyForm,
      );
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cliente]);

  function set<K extends keyof ClientePayload>(key: K, value: ClientePayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    // Limpia strings vacíos para no pisar valores opcionales con "".
    const payload: ClientePayload = {
      ...form,
      tipoDocumento: form.tipoDocumento || undefined,
      numeroDocumento: form.numeroDocumento || undefined,
      telefono: form.telefono || undefined,
      email: form.email || undefined,
      direccion: form.direccion || undefined,
    };

    if (isEdit && cliente) {
      update.mutate(
        { id: cliente.id, payload },
        { onSuccess: onClose },
      );
    } else {
      create.mutate(payload, { onSuccess: onClose });
    }
  }

  const errorMessage =
    mutation.error instanceof ApiError ? mutation.error.message : mutation.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar cliente' : 'Nuevo cliente'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Tipo de documento</label>
            <select
              value={form.tipoDocumento}
              onChange={(e) => set('tipoDocumento', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            >
              <option value="">Sin especificar</option>
              {TIPOS_DOCUMENTO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">N.º de documento</label>
            <input
              type="text"
              value={form.numeroDocumento}
              onChange={(e) => set('numeroDocumento', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Nombre completo <span className="text-red-500">*</span>
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
            <label className="mb-1 block text-sm font-medium text-graphite-900">Teléfono</label>
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => set('telefono', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Dirección</label>
          <input
            type="text"
            value={form.direccion}
            onChange={(e) => set('direccion', e.target.value)}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        {isEdit && (
          <label className="flex items-center gap-2 text-sm text-graphite-900">
            <input
              type="checkbox"
              checked={!!form.estado}
              onChange={(e) => set('estado', e.target.checked)}
              className="rounded border-graphite-300"
            />
            Cliente activo
          </label>
        )}

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
            {mutation.isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
