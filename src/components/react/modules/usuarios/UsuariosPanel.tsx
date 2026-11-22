import { KeyRound, Pencil, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import DataTable, { type Column } from '../../tables/DataTable';
import SearchInput from '../../filters/SearchInput';
import { BadgeActivo, BotonActivo, ConfirmarActivo, FiltroActivoSelector, type FiltroActivo } from '../../ui/Activacion';
import UsuarioFormModal from '../../forms/UsuarioFormModal';
import ResetPasswordModal from '../../forms/ResetPasswordModal';
import QueryProvider from '../../providers/QueryProvider';
import { useUsuarioMutations, useUsuarios } from '../../../../lib/hooks/useUsuarios';
import { ApiError } from '../../../../lib/api/client';
import type { Usuario } from '../../../../types/auth';
import { useAuth } from '../../../../lib/hooks/useAuth';
import Tip from '../../ui/Tip';

const msgError = (e: unknown) => (e instanceof ApiError ? e.message : e ? 'Error inesperado' : null);

function UsuariosPanelContent() {
  const [filtro, setFiltro] = useState<FiltroActivo>('activos');
  const { data: usuarios, isLoading, error } = useUsuarios(filtro);
  const { cambiarActivo } = useUsuarioMutations();
  const { usuario: yo } = useAuth();
  const [search, setSearch] = useState('');
  const [formState, setFormState] = useState<{ open: boolean; usuario: Usuario | null }>({
    open: false,
    usuario: null,
  });
  const [activoTarget, setActivoTarget] = useState<Usuario | null>(null);
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
      render: (row) => <BadgeActivo activo={row.estado} />,
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.id !== yo?.id && (
            <BotonActivo
              activo={row.estado}
              nombre={row.nombre}
              onClick={() => {
                cambiarActivo.reset();
                setActivoTarget(row);
              }}
            />
          )}
          <Tip label="Restablecer contraseña">
            <button
              type="button"
              onClick={() => setResetTarget(row)}
              className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
              aria-label={`Restablecer contraseña de ${row.nombre}`}
            >
              <KeyRound size={15} />
            </button>
          </Tip>
          <Tip label="Editar">
            <button
              type="button"
              onClick={() => setFormState({ open: true, usuario: row })}
              className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-900"
              aria-label={`Editar ${row.nombre}`}
            >
              <Pencil size={15} />
            </button>
          </Tip>
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o email…" />
          <FiltroActivoSelector valor={filtro} onChange={setFiltro} />
        </div>

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

      <ConfirmarActivo
        objetivo={
          activoTarget && {
            nombre: [activoTarget.nombre, activoTarget.apellido].filter(Boolean).join(' '),
            activo: activoTarget.estado,
          }
        }
        entidad="el usuario"
        efectoDesactivar="No podrá iniciar sesión (pierde el acceso de inmediato) ni se le asignarán órdenes."
        isLoading={cambiarActivo.isPending}
        error={msgError(cambiarActivo.error)}
        onClose={() => setActivoTarget(null)}
        onConfirm={() =>
          activoTarget &&
          cambiarActivo.mutate(
            { id: activoTarget.id, activo: !activoTarget.estado },
            { onSuccess: () => setActivoTarget(null) },
          )
        }
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
