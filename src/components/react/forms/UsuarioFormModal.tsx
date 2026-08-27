import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import { useUsuarioMutations } from '../../../lib/hooks/useUsuarios';
import { useRoles } from '../../../lib/hooks/useRoles';
import { ApiError } from '../../../lib/api/client';
import type { Usuario } from '../../../types/auth';
import type { CreateUsuarioPayload } from '../../../types/usuario';

interface UsuarioFormModalProps {
  open: boolean;
  onClose: () => void;
  usuario?: Usuario | null;
}

const emptyForm: CreateUsuarioPayload = {
  rolId: 0,
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  telefono: '',
  estado: true,
};

export default function UsuarioFormModal({ open, onClose, usuario }: UsuarioFormModalProps) {
  const isEdit = !!usuario;
  const { data: roles } = useRoles();
  const { create, update } = useUsuarioMutations();
  const [form, setForm] = useState<CreateUsuarioPayload>(emptyForm);
  const [touched, setTouched] = useState(false);

  const mutation = isEdit ? update : create;

  useEffect(() => {
    if (!open) return;
    setForm(
      usuario
        ? {
            rolId: usuario.rolId,
            nombre: usuario.nombre,
            apellido: usuario.apellido ?? '',
            email: usuario.email,
            password: '',
            telefono: usuario.telefono ?? '',
            estado: usuario.estado,
          }
        : emptyForm,
    );
    setTouched(false);
    mutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, usuario]);

  function set<K extends keyof CreateUsuarioPayload>(key: K, value: CreateUsuarioPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);

    if (!form.rolId || !form.nombre.trim() || !form.email.trim()) return;
    if (!isEdit && form.password.length < 8) return;

    if (isEdit && usuario) {
      update.mutate(
        {
          id: usuario.id,
          payload: {
            rolId: form.rolId,
            nombre: form.nombre,
            apellido: form.apellido || undefined,
            email: form.email,
            telefono: form.telefono || undefined,
            estado: form.estado,
          },
        },
        { onSuccess: onClose },
      );
    } else {
      create.mutate(
        {
          ...form,
          apellido: form.apellido || undefined,
          telefono: form.telefono || undefined,
        },
        { onSuccess: onClose },
      );
    }
  }

  const errorMessage =
    mutation.error instanceof ApiError ? mutation.error.message : mutation.error ? 'Error inesperado' : null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Rol <span className="text-red-500">*</span>
          </label>
          <select
            value={form.rolId}
            onChange={(e) => set('rolId', Number(e.target.value))}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          >
            <option value={0} disabled>
              Selecciona un rol…
            </option>
            {roles?.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
          {touched && !form.rolId && <p className="mt-1 text-xs text-red-600">Selecciona un rol</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={form.nombre}
              onChange={(e) => set('nombre', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Apellido</label>
            <input
              type="text"
              maxLength={100}
              value={form.apellido}
              onChange={(e) => set('apellido', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            maxLength={120}
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
          />
        </div>

        {!isEdit && (
          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              maxLength={72}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
            {touched && form.password.length < 8 && (
              <p className="mt-1 text-xs text-red-600">Mínimo 8 caracteres</p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Teléfono</label>
          <input
            type="tel"
            maxLength={30}
            value={form.telefono}
            onChange={(e) => set('telefono', e.target.value)}
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
            Usuario activo
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
            {mutation.isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
