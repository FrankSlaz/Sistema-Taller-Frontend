import { Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import ConfirmDialog from '../../ui/ConfirmDialog';
import RolFormModal from '../../forms/RolFormModal';
import QueryProvider from '../../providers/QueryProvider';
import { useRolMutations, useRoles } from '../../../../lib/hooks/useRoles';
import { ApiError } from '../../../../lib/api/client';
import type { RolConConteo } from '../../../../types/rol';

function RolesPanelContent() {
  const { data: roles, isLoading, error } = useRoles();
  const { remove } = useRolMutations();
  const [formState, setFormState] = useState<{ open: boolean; rol: RolConConteo | null }>({
    open: false,
    rol: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<RolConConteo | null>(null);

  const accessError = error instanceof ApiError ? error : null;

  const columns: Column<RolConConteo>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'descripcion', header: 'Descripción', render: (row) => row.descripcion ?? '—' },
    {
      key: 'usuarios',
      header: 'Usuarios',
      render: (row) => row._count?.usuarios ?? 0,
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <a
            href={`/roles/${row.id}/permisos`}
            className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
            aria-label={`Permisos de ${row.nombre}`}
            title="Gestionar permisos"
          >
            <ShieldCheck size={15} />
          </a>
          <button
            type="button"
            onClick={() => setFormState({ open: true, rol: row })}
            className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
            aria-label={`Editar ${row.nombre}`}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="rounded-md p-1.5 text-graphite-400 hover:bg-red-50 hover:text-red-600"
            aria-label={`Eliminar ${row.nombre}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  if (accessError) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {accessError.message}. La gestión de roles requiere rol Administrador.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setFormState({ open: true, rol: null })}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
        >
          <Plus size={16} />
          Nuevo rol
        </button>
      </div>

      <DataTable
        columns={columns}
        data={roles ?? []}
        isLoading={isLoading}
        emptyMessage="No se encontraron roles."
        getRowId={(row) => row.id}
      />

      <RolFormModal
        open={formState.open}
        rol={formState.rol}
        onClose={() => setFormState({ open: false, rol: null })}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar rol"
        description={`¿Seguro que deseas eliminar "${deleteTarget?.nombre}"? Si tiene usuarios asignados, no se podrá eliminar.`}
        confirmLabel="Eliminar"
        isLoading={remove.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
      />
    </div>
  );
}

export default function RolesPanel() {
  return (
    <QueryProvider>
      <RolesPanelContent />
    </QueryProvider>
  );
}
