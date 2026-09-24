import { useState } from 'react';
import ReporteShell from './ReporteShell';
import ReporteTable, { type ReporteColumn } from './ReporteTable';
import { useDownloadPdf, useOrdenesPorTipoServicio } from '../../../../lib/hooks/useReportes';
import { reportesApi } from '../../../../lib/api/reportes';
import type { OrdenesPorTipoRow } from '../../../../types/reporte';

export default function OrdenesPorTipoServicioReport() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const query = { fechaInicio: fechaInicio || undefined, fechaFin: fechaFin || undefined };
  const { data, isLoading } = useOrdenesPorTipoServicio(query);
  const pdf = useDownloadPdf(() => reportesApi.ordenesPorTipoServicioPdf(query));

  const columns: ReporteColumn<OrdenesPorTipoRow>[] = [
    { key: 'tipoEquipo', header: 'Tipo de equipo' },
    { key: 'cantidad', header: 'Cantidad de órdenes', align: 'right' },
  ];

  return (
    <ReporteShell
      descripcion="El sistema no distingue un 'tipo de servicio' propio, así que se agrupa por tipo de equipo (Laptop, Celular, etc.) como la categorización más cercana disponible. Fechas opcionales."
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
        </>
      }
      resumen={data ? [{ label: 'Total de órdenes', value: String(data.totalOrdenes) }] : []}
      onDescargarPdf={() => pdf.mutate()}
      isPdfPending={pdf.isPending}
      pdfError={pdf.error}
      isLoading={isLoading}
    >
      <ReporteTable columns={columns} rows={data?.detalle ?? []} />
    </ReporteShell>
  );
}
