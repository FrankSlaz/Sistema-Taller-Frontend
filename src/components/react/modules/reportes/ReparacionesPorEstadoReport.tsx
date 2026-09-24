import { useState } from 'react';
import ReporteShell from './ReporteShell';
import ReporteTable, { type ReporteColumn } from './ReporteTable';
import { useDownloadPdf, useReparacionesPorEstado } from '../../../../lib/hooks/useReportes';
import { reportesApi } from '../../../../lib/api/reportes';
import type { ReparacionesPorEstadoRow } from '../../../../types/reporte';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function ReparacionesPorEstadoReport() {
  const ahora = new Date();
  const [mes, setMes] = useState(ahora.getMonth() + 1);
  const [anio, setAnio] = useState(ahora.getFullYear());

  const query = { mes, anio };
  const { data, isLoading } = useReparacionesPorEstado(query);
  const pdf = useDownloadPdf(() => reportesApi.reparacionesPorEstadoPdf(query));

  const columns: ReporteColumn<ReparacionesPorEstadoRow>[] = [
    { key: 'estado', header: 'Estado' },
    { key: 'cantidad', header: 'Cantidad', align: 'right' },
  ];

  return (
    <ReporteShell
      descripcion="Cantidad de órdenes ingresadas en el mes, agrupadas por estado actual."
      filtros={
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Mes</label>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            >
              {MESES.map((nombre, i) => (
                <option key={nombre} value={i + 1}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Año</label>
            <input
              type="number"
              min={2000}
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="w-24 rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </>
      }
      resumen={
        data
          ? [
              { label: 'Periodo', value: data.periodo },
              { label: 'Total de órdenes', value: String(data.totalOrdenes) },
            ]
          : []
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
