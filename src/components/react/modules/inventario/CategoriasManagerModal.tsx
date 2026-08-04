import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import Modal from '../../ui/Modal';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { useCategoriaMutations, useCategorias } from '../../../../lib/hooks/useCategorias';
import { ApiError } from '../../../../lib/api/client';
import type { Categoria, CategoriaPayload } from '../../../../types/categoria';

interface CategoriasManagerModalProps {
  open: boolean;
  onClose: () => void;
}

const emptyForm: CategoriaPayload = { nombre: '', descripcion: '', estado: true };

export default function CategoriasManagerModal({ open, onClose }: CategoriasManagerModalProps) {
  const { data: categorias, isLoading } = useCategorias();
  const { create, update, remove } = useCategoriaMutations();
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [form, setForm] = useState<CategoriaPayload>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Categoria | null>(null);

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
      estado: categoria.estado ?? true,
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
              <div>
                <p className="font-medium text-graphite-900">{cat.nombre}</p>
                <p className="text-xs text-graphite-400">
                  {cat._count?.productos ?? 0} producto{cat._count?.productos === 1 ? '' : 's'}
                  {cat.estado === false && ' · inactiva'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(cat)}
                  className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
                  aria-label={`Editar ${cat.nombre}`}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(cat)}
                  className="rounded-md p-1.5 text-graphite-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Eliminar ${cat.nombre}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {!formOpen && (
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
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-md p-1 text-graphite-400 hover:bg-graphite-50"
                aria-label="Cerrar formulario"
              >
                <X size={14} />
              </button>
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

            {editing && (
              <label className="flex items-center gap-2 text-sm text-graphite-900">
                <input
                  type="checkbox"
                  checked={!!form.estado}
                  onChange={(e) => setForm((p) => ({ ...p, estado: e.target.checked }))}
                  className="rounded border-graphite-300"
                />
                Categoría activa
              </label>
            )}

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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar categoría"
        description={`¿Seguro que deseas eliminar "${deleteTarget?.nombre}"? Si tiene productos asociados, no se podrá eliminar.`}
        confirmLabel="Eliminar"
        isLoading={remove.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
      />
    </Modal>
  );
}
