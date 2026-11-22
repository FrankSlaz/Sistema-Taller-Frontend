import { useEffect, useState } from 'react';
import Badge from '../../ui/Badge';
import { useReporte } from '../../../../lib/hooks/useReportes';
import { useCategorias } from '../../../../lib/hooks/useCategorias';
import type { SituacionStock, StockRow } from '../../../../types/reporte';
import {
  FiltroSelect,
  FiltroTexto,
  KpiGrid,
  ReporteShell,
  Seccion,
  Tabla,
  bs,
  dias,
  entero,
  pl,
} from './compartido';

const SITUACIONES: { valor: SituacionStock; etiqueta: string }[] = [
  { valor: 'TODOS', etiqueta: 'Todos los productos' },
  { valor: 'EN_ALERTA', etiqueta: 'En alerta (sin stock + bajo mínimo)' },
  { valor: 'SIN_STOCK', etiqueta: 'Sin stock' },
  { valor: 'BAJO_MINIMO', etiqueta: 'Bajo mínimo' },
  { valor: 'NORMAL', etiqueta: 'Stock normal' },
];

const BADGE: Record<StockRow['situacion'], { label: string; className: string }> = {
  SIN_STOCK: { label: 'Sin stock', className: 'bg-red-50 text-red-700 ring-red-600/20' },
  BAJO_MINIMO: { label: 'Bajo mínimo', className: 'bg-amber-50 text-amber-800 ring-amber-600/20' },
  NORMAL: { label: 'Normal', className: 'bg-green-50 text-green-700 ring-green-600/20' },
};

export default function StockReport() {
  const [situacion, setSituacion] = useState<SituacionStock>('TODOS');
  const [categoriaId, setCategoriaId] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [search, setSearch] = useState('');
  const { data: categorias } = useCategorias('todos');

  // Espera a que el usuario deje de escribir para no consultar por cada tecla.
  useEffect(() => {
    const t = setTimeout(() => setSearch(busqueda.trim()), 350);
    return () => clearTimeout(t);
  }, [busqueda]);

  const { data, isLoading, isFetching, error, pdf } = useReporte('stock', {
    situacion,
    categoriaId: categoriaId ? Number(categoriaId) : undefined,
    search: search || undefined,
  });
  const k = data?.kpis;

  return (
    <ReporteShell
      descripcion="Inventario valorizado con alertas y compra sugerida. La cobertura indica cuántos días alcanza el stock al ritmo de consumo de los últimos 90 días; el sugerido cubre el mínimo más 30 días de consumo."
      filtros={
        <>
          <FiltroSelect
            label="Situación"
            valor={situacion}
            onChange={(v) => setSituacion(v as SituacionStock)}
            opciones={SITUACIONES}
            todos={null}
          />
          <FiltroSelect
            label="Categoría"
            valor={categoriaId}
            onChange={setCategoriaId}
            todos="Todas"
            opciones={(categorias ?? []).map((c) => ({ valor: String(c.id), etiqueta: c.nombre }))}
          />
          <FiltroTexto label="Buscar" valor={busqueda} onChange={setBusqueda} placeholder="Nombre, código o marca…" />
        </>
      }
      onPdf={() => pdf.mutate()}
      pdfPending={pdf.isPending}
      pdfError={pdf.error}
      isLoading={isLoading}
      isFetching={isFetching}
      error={error}
    >
      {data && k && (
        <div className="space-y-6">
          <KpiGrid
            kpis={[
              { label: 'Productos', valor: entero(k.productos), detalle: pl(k.unidades, 'unidad', 'unidades') },
              { label: 'Valor del inventario', valor: bs(k.valorInventario), detalle: 'A precio de compra' },
              { label: 'Valor de venta est.', valor: bs(k.valorVentaEstimado), detalle: 'A precio de referencia' },
              { label: 'Sin stock', valor: entero(k.sinStock), tono: k.sinStock ? 'malo' : 'bueno' },
              { label: 'Bajo mínimo', valor: entero(k.bajoMinimo), tono: k.bajoMinimo ? 'alerta' : 'bueno' },
              { label: 'Inversión para reponer', valor: bs(k.costoReposicion), detalle: 'Compra sugerida', tono: k.costoReposicion ? 'alerta' : 'neutral' },
              { label: 'Sin movimiento 90 días', valor: entero(k.sinMovimiento90Dias), detalle: 'Capital inmovilizado' },
            ]}
          />

          <Seccion titulo="Resumen por categoría">
            <Tabla
              clave={(c) => c.categoria}
              filas={data.porCategoria}
              tono={(c) => (c.alertas ? 'alerta' : undefined)}
              columnas={[
                { titulo: 'Categoría', render: (c) => c.categoria },
                { titulo: 'Productos', alinear: 'right', render: (c) => c.productos },
                { titulo: 'Unidades', alinear: 'right', render: (c) => c.unidades },
                { titulo: 'En alerta', alinear: 'right', render: (c) => c.alertas },
                { titulo: 'Valor', alinear: 'right', render: (c) => bs(c.valor) },
              ]}
              totales={['Total', k.productos, k.unidades, k.sinStock + k.bajoMinimo, bs(k.valorInventario)]}
            />
          </Seccion>

          <Seccion titulo={`Detalle de productos (${data.detalle.length})`} descripcion="Primero lo urgente: sin stock, luego bajo mínimo.">
            <Tabla
              clave={(p) => p.productoId}
              filas={data.detalle}
              vacio="No hay productos que cumplan los filtros."
              tono={(p) => (p.situacion === 'SIN_STOCK' ? 'malo' : p.situacion === 'BAJO_MINIMO' ? 'alerta' : undefined)}
              columnas={[
                { titulo: 'Código', render: (p) => p.codigo, className: 'whitespace-nowrap' },
                { titulo: 'Producto', render: (p) => (<><p className="text-graphite-900">{p.nombre}</p>{p.marca && <p className="text-xs text-graphite-400">{p.marca}</p>}</>) },
                { titulo: 'Categoría', render: (p) => p.categoria },
                { titulo: 'Situación', render: (p) => <Badge {...BADGE[p.situacion]} /> },
                { titulo: 'Stock', alinear: 'right', render: (p) => <span className="font-semibold">{p.stockActual}</span> },
                { titulo: 'Mín.', alinear: 'right', render: (p) => p.stockMinimo },
                { titulo: 'Consumo 90d', alinear: 'right', render: (p) => p.consumo90Dias },
                { titulo: 'Cobertura', alinear: 'right', render: (p) => (p.coberturaDias === null ? '—' : dias(p.coberturaDias)) },
                { titulo: 'Valor stock', alinear: 'right', render: (p) => bs(p.valorStock) },
                { titulo: 'Sugerido', alinear: 'right', render: (p) => (p.sugeridoComprar ? <span className="font-semibold">{p.sugeridoComprar}</span> : '—') },
                { titulo: 'Costo reponer', alinear: 'right', render: (p) => (p.costoReposicion ? bs(p.costoReposicion) : '—') },
              ]}
              totales={['', '', '', '', k.unidades, '', '', '', bs(k.valorInventario), '', bs(k.costoReposicion)]}
            />
          </Seccion>
        </div>
      )}
    </ReporteShell>
  );
}
