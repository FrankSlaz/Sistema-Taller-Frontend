import { AlertTriangle, Info, OctagonAlert } from 'lucide-react';
import { useState } from 'react';
import { useReporte } from '../../../../lib/hooks/useReportes';
import type { RangoFechas } from '../../../../types/reporte';
import {
  BarList,
  FiltroFechas,
  KpiGrid,
  ReporteShell,
  Seccion,
  Tabla,
  bs,
  dias,
  entero,
  pl,
  porc,
  presetRango,
  tonoVariacion,
  variacionTexto,
} from './compartido';

const NIVEL = {
  alta: { Icono: OctagonAlert, clase: 'border-red-200 bg-red-50 text-red-800', etiqueta: 'Urgente' },
  media: { Icono: AlertTriangle, clase: 'border-amber-200 bg-amber-50 text-amber-900', etiqueta: 'Atención' },
  info: { Icono: Info, clase: 'border-graphite-200 bg-graphite-50 text-graphite-700', etiqueta: 'Aviso' },
};

export default function ResumenReport() {
  const [rango, setRango] = useState<RangoFechas>(presetRango('mes'));
  const { data, isLoading, isFetching, error, pdf } = useReporte('resumen', rango);
  const k = data?.kpis;

  return (
    <ReporteShell
      descripcion="La foto del taller en una página: cómo van los ingresos y la producción frente al período anterior, y una lista de lo que conviene atender primero."
      filtros={<FiltroFechas valor={rango} onChange={setRango} />}
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
              { label: 'Ingresos', valor: bs(k.ingresos), detalle: variacionTexto(k.variacionIngresos), tono: tonoVariacion(k.variacionIngresos) },
              { label: 'Órdenes ingresadas', valor: entero(k.ordenesIngresadas), detalle: variacionTexto(k.variacionIngresadas), tono: tonoVariacion(k.variacionIngresadas) },
              { label: 'Órdenes entregadas', valor: entero(k.ordenesEntregadas), detalle: variacionTexto(k.variacionEntregadas), tono: tonoVariacion(k.variacionEntregadas) },
              { label: 'Ticket promedio', valor: bs(k.ticketPromedio), detalle: 'Por orden entregada' },
              { label: 'Tiempo prom. reparación', valor: dias(k.tiempoPromedioReparacion), detalle: 'Del ingreso a la entrega' },
              { label: 'Aprobación de presupuestos', valor: porc(k.tasaAprobacionPresupuestos), detalle: pl(k.presupuestosPendientes, 'pendiente de respuesta', 'pendientes de respuesta') },
              { label: 'En taller ahora', valor: entero(k.ordenesActivas), detalle: `${entero(k.ordenesRetrasadas)} con retraso`, tono: k.ordenesRetrasadas ? 'alerta' : 'neutral' },
              { label: 'Por cobrar', valor: bs(k.saldoPorCobrar), tono: k.saldoPorCobrar ? 'alerta' : 'bueno' },
              { label: 'Productos en alerta', valor: entero(k.productosEnAlerta), detalle: 'Sin stock o bajo mínimo', tono: k.productosEnAlerta ? 'alerta' : 'bueno' },
              { label: 'Garantías activas', valor: entero(k.garantiasActivas), detalle: `${pl(k.garantiasPorVencer, 'vence', 'vencen')} en 15 días` },
            ]}
          />

          <Seccion titulo="Qué atender primero" descripcion="Generado automáticamente a partir de los datos del sistema.">
            {data.alertas.length === 0 ? (
              <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                Sin alertas: todo en orden.
              </p>
            ) : (
              <ul className="space-y-2">
                {data.alertas.map((a, i) => {
                  const { Icono, clase, etiqueta } = NIVEL[a.nivel];
                  return (
                    <li key={i} className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${clase}`}>
                      <Icono size={16} className="mt-0.5 shrink-0" aria-hidden />
                      <span>
                        <span className="sr-only">{etiqueta}: </span>
                        {a.mensaje}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Seccion>

          <div className="grid gap-6 lg:grid-cols-2">
            <Seccion titulo="Tipos de equipo más atendidos">
              <BarList
                items={data.topTiposEquipo.map((t) => ({
                  etiqueta: t.tipoEquipo,
                  valor: t.cantidad,
                  texto: pl(t.cantidad, 'orden', 'órdenes'),
                }))}
              />
            </Seccion>
            <Seccion titulo="Técnicos destacados">
              <Tabla
                clave={(t) => t.tecnicoId}
                filas={data.topTecnicos}
                vacio="Ningún técnico entregó órdenes en este período."
                columnas={[
                  { titulo: 'Técnico', render: (t) => t.nombre },
                  { titulo: 'Entregadas', alinear: 'right', render: (t) => t.entregadas },
                  { titulo: 'Éxito', alinear: 'right', render: (t) => porc(t.tasaExito) },
                  { titulo: 'Facturación', alinear: 'right', render: (t) => bs(t.facturacion) },
                ]}
              />
            </Seccion>
          </div>
        </div>
      )}
    </ReporteShell>
  );
}
