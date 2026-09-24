import { useState } from 'react';
import ReporteShell from './ReporteShell';
import ReporteTable, { type ReporteColumn } from './ReporteTable';
import { useClientesFrecuentes, useDownloadPdf } from '../../../../lib/hooks/useReportes';
import { reportesApi } from '../../../../lib/api/reportes';
import type { ClienteFrecuenteRow } from '../../../../types/reporte';

export default function ClientesFrecuentesReport() {
  const [minOrdenes, setMinOrdenes] = useState(2);
  const [limit, setLimit] = useState(20);

  const query = { minOrdenes, limit };
  const { data, isLoading } = useClientesFrecuentes(query);
  const pdf = useDownloadPdf(() => reportesApi.clientesFrecuentesPdf(query));

  const columns: ReporteColumn<ClienteFrecuenteRow>[] = [
    { key: 'nombre', header: 'Cliente' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'totalOrdenes', header: 'Total de órdenes', align: 'right' },
  ];

  return (
    <ReporteShell
      descripcion={`Clientes con ${minOrdenes} o más órdenes registradas (histórico completo), ordenados de mayor a menor.`}
      filtros={
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Mínimo de órdenes</label>
            <input
              type="number"
              min={1}
              value={minOrdenes}
              onChange={(e) => setMinOrdenes(Number(e.target.value))}
              className="w-24 rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Máximo a mostrar</label>
            <input
              type="number"
              min={1}
              max={100}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-24 rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </>
      }
      onDescargarPdf={() => pdf.mutate()}
      isPdfPending={pdf.isPending}
      pdfError={pdf.error}
      isLoading={isLoading}
    >
      <ReporteTable
        columns={columns}
        rows={data?.detalle ?? []}
        emptyMessage="Aún no hay clientes que cumplan el umbral de reincidencia."
      />
    </ReporteShell>
  );
}
