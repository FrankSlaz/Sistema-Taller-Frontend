import ReporteShell from './ReporteShell';
import ReporteTable, { type ReporteColumn } from './ReporteTable';
import { useDownloadPdf, useStockBajo } from '../../../../lib/hooks/useReportes';
import { reportesApi } from '../../../../lib/api/reportes';
import type { StockBajoRow } from '../../../../types/reporte';

export default function StockBajoReport() {
  const { data, isLoading } = useStockBajo();
  const pdf = useDownloadPdf(() => reportesApi.stockBajoPdf());

  const columns: ReporteColumn<StockBajoRow>[] = [
    { key: 'codigo', header: 'Código' },
    { key: 'nombre', header: 'Producto' },
    { key: 'categoria', header: 'Categoría' },
    { key: 'stockActual', header: 'Stock actual', align: 'right' },
    { key: 'stockMinimo', header: 'Stock mínimo', align: 'right' },
  ];

  return (
    <ReporteShell
      descripcion="Productos activos cuyo stock actual está por debajo (o igual) del mínimo configurado. Sin filtros: siempre muestra el estado actual del inventario."
      resumen={data ? [{ label: 'Productos en alerta', value: String(data.totalProductosEnAlerta) }] : []}
      onDescargarPdf={() => pdf.mutate()}
      isPdfPending={pdf.isPending}
      pdfError={pdf.error}
      isLoading={isLoading}
    >
      <ReporteTable
        columns={columns}
        rows={data?.detalle ?? []}
        emptyMessage="No hay productos con stock por debajo del mínimo."
      />
    </ReporteShell>
  );
}
