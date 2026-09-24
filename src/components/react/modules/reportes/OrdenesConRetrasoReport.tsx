import ReporteShell from './ReporteShell';
import ReporteTable, { type ReporteColumn } from './ReporteTable';
import { useDownloadPdf, useOrdenesConRetraso } from '../../../../lib/hooks/useReportes';
import { reportesApi } from '../../../../lib/api/reportes';
import type { OrdenRetrasoRow } from '../../../../types/reporte';

function formatFecha(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function OrdenesConRetrasoReport() {
  const { data, isLoading } = useOrdenesConRetraso();
  const pdf = useDownloadPdf(() => reportesApi.ordenesConRetrasoPdf());

  const columns: ReporteColumn<OrdenRetrasoRow>[] = [
    { key: 'codigoOrden', header: 'Orden' },
    { key: 'cliente', header: 'Cliente' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'estado', header: 'Estado' },
    {
      key: 'fechaEstimadaEntrega',
      header: 'Entrega estimada',
      render: (row) => formatFecha(row.fechaEstimadaEntrega),
    },
    { key: 'diasRetraso', header: 'Días de retraso', align: 'right' },
  ];

  return (
    <ReporteShell
      descripcion="Órdenes activas (no entregadas, no canceladas, no marcadas 'no reparable') cuya fecha estimada de entrega ya pasó. Sin filtros: siempre es el estado actual."
      resumen={data ? [{ label: 'Órdenes con retraso', value: String(data.totalOrdenesConRetraso) }] : []}
      onDescargarPdf={() => pdf.mutate()}
      isPdfPending={pdf.isPending}
      pdfError={pdf.error}
      isLoading={isLoading}
    >
      <ReporteTable
        columns={columns}
        rows={data?.detalle ?? []}
        emptyMessage="No hay órdenes con retraso actualmente. 🎉"
      />
    </ReporteShell>
  );
}
