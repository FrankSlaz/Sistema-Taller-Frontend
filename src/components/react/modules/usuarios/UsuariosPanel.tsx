import { KeyRound, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import SearchInput from '../../filters/SearchInput';
import ConfirmDialog from '../../ui/ConfirmDialog';
import UsuarioFormModal from '../../forms/UsuarioFormModal';
import ResetPasswordModal from '../../forms/ResetPasswordModal';
import QueryProvider from '../../providers/QueryProvider';
import { useUsuarioMutations, useUsuarios } from '../../../../lib/hooks/useUsuarios';
import { ApiError } from '../../../../lib/api/client';
import type { Usuario } from '../../../../types/auth';

function UsuariosPanelContent() {
  const { data: usuarios, isLoading, error } = useUsuarios();
  const { update, remove } = useUsuarioMutations();
  const [search, setSearch] = useState('');
  const [formState, setFormState] = useState<{ open: boolean; usuario: Usuario | null }>({
    open: false,
    usuario: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null);
  const [resetTarget, setResetTarget] = useState<Usuario | null>(null);

  // GET /usuarios no admite `search` por query: filtra en el cliente
  // sobre la lista completa (findAll tampoco pagina).
  const filtrados = useMemo(() => {
    if (!usuarios) return [];
    const q = search.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) =>
      `${u.nombre} ${u.apellido ?? ''} ${u.email}`.toLowerCase().includes(q),
    );
  }, [usuarios, search]);

  const accessError = error instanceof ApiError ? error : null;

  const columns: Column<Usuario>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (row) => (
        <div>
          <p className="font-medium text-graphite-900">
            {row.nombre} {row.apellido ?? ''}
          </p>
          <p className="text-xs text-graphite-400">{row.email}</p>
        </div>
      ),
    },
    { key: 'rol', header: 'Rol', render: (row) => row.rol?.nombre ?? '—' },
    { key: 'telefono', header: 'Teléfono', render: (row) => row.telefono ?? '—' },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => (
        <span
          className={
            row.estado
              ? 'inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20'
              : 'inline-flex items-center rounded-full bg-graphite-100 px-2.5 py-0.5 text-xs font-medium text-graphite-600 ring-1 ring-inset ring-graphite-500/20'
          }
        >
          {row.estado ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => update.mutate({ id: row.id, payload: { estado: !row.estado } })}
            disabled={update.isPending}
            className={`rounded-md p-1.5 hover:bg-graphite-50 ${
              row.estado ? 'text-graphite-400 hover:text-amber-600' : 'text-graphite-400 hover:text-green-600'
            }`}
            aria-label={row.estado ? `Desactivar ${row.nombre}` : `Reactivar ${row.nombre}`}
            title={row.estado ? 'Desactivar (reversible)' : 'Reactivar'}
          >
            <Power size={15} />
          </button>
          <button
            type="button"
            onClick={() => setResetTarget(row)}
            className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
            aria-label={`Restablecer contraseña de ${row.nombre}`}
            title="Restablecer contraseña"
          >
            <KeyRound size={15} />
          </button>
          <button
            type="button"
            onClick={() => setFormState({ open: true, usuario: row })}
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
            title="Eliminar (irreversible)"
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
        {accessError.message}. La gestión de usuarios requiere rol Administrador.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o email…" />

        <button
          type="button"
          onClick={() => setFormState({ open: true, usuario: null })}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
        >
          <Plus size={16} />
          Nuevo usuario
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filtrados}
        isLoading={isLoading}
        emptyMessage="No se encontraron usuarios."
        getRowId={(row) => row.id}
      />

      <UsuarioFormModal
        open={formState.open}
        usuario={formState.usuario}
        onClose={() => setFormState({ open: false, usuario: null })}
      />

      <ResetPasswordModal open={!!resetTarget} usuario={resetTarget} onClose={() => setResetTarget(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar usuario"
        description={`Esta acción es irreversible: "${deleteTarget?.nombre}" desaparecerá por completo del sistema (no solo se desactiva). Si solo quieres bloquear su acceso temporalmente, usa el botón de encendido (⏻) en vez de esto.`}
        confirmLabel="Eliminar definitivamente"
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

export default function UsuariosPanel() {
  return (
    <QueryProvider>
      <UsuariosPanelContent />
    </QueryProvider>
  );
}
