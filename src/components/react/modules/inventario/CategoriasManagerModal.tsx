import { Pencil, Plus, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import Modal from '../../ui/Modal';
import { BadgeActivo, BotonActivo, ConfirmarActivo } from '../../ui/Activacion';
import { useCategoriaMutations, useCategorias } from '../../../../lib/hooks/useCategorias';
import { ApiError } from '../../../../lib/api/client';
import type { Categoria, CategoriaPayload } from '../../../../types/categoria';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import Tip from '../../ui/Tip';

interface CategoriasManagerModalProps {
  open: boolean;
  onClose: () => void;
}

const emptyForm: CategoriaPayload = { nombre: '', descripcion: '' };

export default function CategoriasManagerModal({ open, onClose }: CategoriasManagerModalProps) {
  const { data: categorias, isLoading } = useCategorias('todos');
  const { create, update, cambiarActivo } = useCategoriaMutations();
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [form, setForm] = useState<CategoriaPayload>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [activoTarget, setActivoTarget] = useState<Categoria | null>(null);
  const puedeCrear = usePermiso('inventario:crear');
  const puedeEditar = usePermiso('inventario:editar');
  const puedeEliminar = usePermiso('inventario:eliminar');

  const mutation = editing ? update : create;
  const errorMessage =
    mutation.error instanceof ApiError ? mutation.error.message : mutation.error ? 'Error inesperado' : null;

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
    mutation.reset();
  }

  function startEdit(categoria: Categoria) {
    setEditing(categoria);
    setForm({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? '',
    });
    setFormOpen(true);
    mutation.reset();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = { ...form, descripcion: form.descripcion || undefined };

    if (editing) {
      update.mutate({ id: editing.id, payload }, { onSuccess: () => setFormOpen(false) });
    } else {
      create.mutate(payload, { onSuccess: () => setFormOpen(false) });
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Categorías de producto">
      <div className="space-y-3">
        <ul className="max-h-64 space-y-1 overflow-y-auto">
          {isLoading && <li className="text-sm text-graphite-400">Cargando…</li>}
          {categorias?.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center justify-between rounded-md border border-graphite-100 px-3 py-2 text-sm"
            >
              <div className={cat.estado === false ? 'opacity-60' : ''}>
                <p className="flex items-center gap-2 font-medium text-graphite-900">
                  {cat.nombre}
                  {cat.estado === false && <BadgeActivo activo={false} femenino />}
                </p>
                <p className="text-xs text-graphite-400">
                  {cat._count?.productos ?? 0} producto{cat._count?.productos === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {puedeEditar && (
                  <Tip label="Editar">
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
                      aria-label={`Editar ${cat.nombre}`}
                    >
                      <Pencil size={14} />
                    </button>
                  </Tip>
                )}
                {puedeEliminar && (
                  <BotonActivo
                    activo={cat.estado}
                    nombre={cat.nombre}
                    size={14}
                    onClick={() => {
                      cambiarActivo.reset();
                      setActivoTarget(cat);
                    }}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>

        {!formOpen && puedeCrear && (
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite-900 hover:underline"
          >
            <Plus size={15} />
            Nueva categoría
          </button>
        )}

        {formOpen && (
          <form onSubmit={handleSubmit} className="space-y-3 rounded-md border border-graphite-100 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-graphite-900">
                {editing ? `Editar "${editing.nombre}"` : 'Nueva categoría'}
              </p>
              <Tip label="Cerrar">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-md p-1 text-graphite-400 hover:bg-graphite-50"
                  aria-label="Cerrar formulario"
                >
                  <X size={14} />
                </button>
              </Tip>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-graphite-900">Nombre</label>
              <input
                type="text"
                required
                maxLength={100}
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-graphite-900">Descripción</label>
              <input
                type="text"
                maxLength={255}
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
              />
            </div>

            {errorMessage && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="rounded-md bg-graphite-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-50"
              >
                {mutation.isPending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear categoría'}
              </button>
            </div>
          </form>
        )}
      </div>

      <ConfirmarActivo
        objetivo={activoTarget && { nombre: activoTarget.nombre, activo: activoTarget.estado }}
        entidad="la categoría"
        efectoDesactivar="No se podrá elegir para productos nuevos (los que ya la tienen la conservan)."
        isLoading={cambiarActivo.isPending}
        error={cambiarActivo.error instanceof ApiError ? cambiarActivo.error.message : cambiarActivo.error ? 'Error inesperado' : null}
        onClose={() => setActivoTarget(null)}
        onConfirm={() =>
          activoTarget &&
          cambiarActivo.mutate(
            { id: activoTarget.id, activo: activoTarget.estado === false },
            { onSuccess: () => setActivoTarget(null) },
          )
        }
      />
    </Modal>
  );
}
