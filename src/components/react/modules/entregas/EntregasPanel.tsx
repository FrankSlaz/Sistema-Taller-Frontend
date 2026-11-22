import { useMutation } from '@tanstack/react-query';
import { FileDown, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import Pagination from '../../ui/Pagination';
import Badge from '../../ui/Badge';
import EntregaFormModal from '../../forms/EntregaFormModal';
import QueryProvider from '../../providers/QueryProvider';
import { useEntregas } from '../../../../lib/hooks/useEntregas';
import { usePermiso } from '../../../../lib/hooks/useAuth';
import { entregasApi } from '../../../../lib/api/entregas';
import { ApiError } from '../../../../lib/api/client';
import type { Entrega } from '../../../../types/entrega';
import { FiltroTexto, Tabla } from '../reportes/compartido';

const LIMIT = 15;

function formatFechaHora(value: string) {
  return new Date(value).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function EntregasPanelContent() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [search, setSearch] = useState('');
  const puedeCrear = usePermiso('entregas:crear');
  const acta = useMutation({
    mutationFn: (e: Entrega) => entregasApi.acta(e.id, e.orden?.codigoOrden ?? String(e.ordenId)),
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(busqueda.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [busqueda]);

  const { data, isLoading, isFetching } = useEntregas({ page, limit: LIMIT, search: search || undefined });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <FiltroTexto label="Buscar" valor={busqueda} onChange={setBusqueda} placeholder="Orden, cliente o quién retiró…" />
        {puedeCrear && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800"
          >
            <Plus size={16} />
            Registrar entrega
          </button>
        )}
      </div>

      {acta.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {acta.error instanceof ApiError ? acta.error.message : 'No se pudo generar el acta'}
        </p>
      )}

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-lg bg-graphite-100" />
      ) : (
        <Tabla
          clave={(e) => e.id}
          filas={data?.items ?? []}
          vacio="No se encontraron entregas."
          columnas={[
            { titulo: 'Fecha', render: (e) => formatFechaHora(e.fechaEntrega), className: 'whitespace-nowrap' },
            {
              titulo: 'Orden',
              render: (e) => (
                <a href={`/reparaciones/${e.ordenId}`} className="font-medium text-graphite-900 hover:underline">
                  {e.orden?.codigoOrden ?? `#${e.ordenId}`}
                </a>
              ),
            },
            { titulo: 'Cliente', render: (e) => e.orden?.cliente?.nombre ?? '—' },
            {
              titulo: 'Equipo',
              render: (e) => [e.orden?.equipo?.tipoEquipo, e.orden?.equipo?.marca, e.orden?.equipo?.modelo].filter(Boolean).join(' ') || '—',
            },
            {
              titulo: 'Tipo',
              render: (e) =>
                e.orden?.estado?.nombre === 'ENTREGADO' ? (
                  <Badge label="Entrega" className="bg-green-50 text-green-700 ring-green-600/20" />
                ) : (
                  <Badge label="Devolución" className="bg-amber-50 text-amber-800 ring-amber-600/20" />
                ),
            },
            {
              titulo: 'Retiró',
              render: (e) => (
                <>
                  <p>{e.nombreRecibe ?? '—'}</p>
                  {e.documentoRecibe && <p className="text-xs text-graphite-400">{e.documentoRecibe}</p>}
                </>
              ),
            },
            {
              titulo: '',
              render: (e) => (
                <button
                  type="button"
                  onClick={() => acta.mutate(e)}
                  className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-100 hover:text-graphite-900"
                  aria-label="Acta de entrega"
                  title="Acta de entrega (PDF)"
                >
                  <FileDown size={15} />
                </button>
              ),
            },
          ]}
        />
      )}
      {isFetching && !isLoading && <p className="text-xs text-graphite-400">Actualizando…</p>}

      {data && data.meta.totalPages > 1 && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} onPageChange={setPage} />
      )}

      <EntregaFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}

export default function EntregasPanel() {
  return (
    <QueryProvider>
      <EntregasPanelContent />
    </QueryProvider>
  );
}
