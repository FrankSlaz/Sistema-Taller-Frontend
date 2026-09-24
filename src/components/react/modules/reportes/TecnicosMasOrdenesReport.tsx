import { useState } from 'react';
import ReporteShell from './ReporteShell';
import ReporteTable, { type ReporteColumn } from './ReporteTable';
import { useDownloadPdf, useTecnicosMasOrdenes } from '../../../../lib/hooks/useReportes';
import { reportesApi } from '../../../../lib/api/reportes';
import type { TecnicoRankingRow } from '../../../../types/reporte';

export default function TecnicosMasOrdenesReport() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [limit, setLimit] = useState(10);

  const query = {
    fechaInicio: fechaInicio || undefined,
    fechaFin: fechaFin || undefined,
    limit,
  };
  const { data, isLoading } = useTecnicosMasOrdenes(query);
  const pdf = useDownloadPdf(() => reportesApi.tecnicosMasOrdenesPdf(query));

  const columns: ReporteColumn<TecnicoRankingRow>[] = [
    { key: 'nombre', header: 'Técnico' },
    { key: 'ordenesCerradas', header: 'Órdenes cerradas (ENTREGADO)', align: 'right' },
  ];

  return (
    <ReporteShell
      descripcion="Ranking de técnicos por cantidad de órdenes que llegaron a estado ENTREGADO. Las fechas son opcionales; sin ellas, se cuenta todo el historial."
      filtros={
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Desde (opcional)</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Hasta (opcional)</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Top</label>
            <input
              type="number"
              min={1}
              max={50}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-20 rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </>
      }
      onDescargarPdf={() => pdf.mutate()}
      isPdfPending={pdf.isPending}
      pdfError={pdf.error}
      isLoading={isLoading}
    >
      <ReporteTable columns={columns} rows={data?.detalle ?? []} />
    </ReporteShell>
  );
}
