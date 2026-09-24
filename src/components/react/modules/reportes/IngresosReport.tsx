import { useState } from 'react';
import ReporteShell from './ReporteShell';
import ReporteTable, { type ReporteColumn } from './ReporteTable';
import { useDownloadPdf, useIngresos } from '../../../../lib/hooks/useReportes';
import { reportesApi } from '../../../../lib/api/reportes';
import type { IngresosPorMetodoRow } from '../../../../types/reporte';

function formatMonto(value: number) {
  return `Bs ${value.toFixed(2)}`;
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function IngresosReport() {
  const [fechaInicio, setFechaInicio] = useState(hoyISO());
  const [fechaFin, setFechaFin] = useState(hoyISO());

  const query = { fechaInicio, fechaFin };
  const { data, isLoading } = useIngresos(query);
  const pdf = useDownloadPdf(() => reportesApi.ingresosPdf(query));

  const columns: ReporteColumn<IngresosPorMetodoRow>[] = [
    { key: 'metodoPago', header: 'Método de pago' },
    { key: 'cantidadPagos', header: 'Cant. pagos', align: 'right' },
    { key: 'totalMonto', header: 'Total', align: 'right', render: (row) => formatMonto(row.totalMonto) },
  ];

  return (
    <ReporteShell
      descripcion="Ingresos registrados en el rango de fechas, desglosados por método de pago. Ambas fechas son obligatorias."
      filtros={
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Desde</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-graphite-900">Hasta</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="rounded-md border border-graphite-200 px-3 py-2 text-sm focus:border-graphite-800 focus:outline-none focus:ring-1 focus:ring-graphite-800"
            />
          </div>
        </>
      }
      resumen={
        data
          ? [
              { label: 'Total de pagos', value: String(data.totalPagos) },
              { label: 'Total ingresos', value: formatMonto(data.totalIngresos) },
            ]
          : []
      }
      onDescargarPdf={() => pdf.mutate()}
      isPdfPending={pdf.isPending}
      pdfError={pdf.error}
      isLoading={isLoading}
    >
      <ReporteTable columns={columns} rows={data?.porMetodoPago ?? []} />
    </ReporteShell>
  );
}
