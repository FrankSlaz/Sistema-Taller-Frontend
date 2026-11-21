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
  porc,
} from './compartido';

export default function OrdenesPorTipoServicioReport() {
  const [rango, setRango] = useState<RangoFechas>({});
  const { data, isLoading, isFetching, error, pdf } = useReporte('ordenesPorTipoServicio', rango);
  const k = data?.kpis;

  return (
    <ReporteShell
      descripcion="Qué equipos llegan más, cuáles se reparan con éxito y cuáles dejan mejor ticket. Ayuda a decidir en qué especializarse, qué repuestos tener y qué publicitar."
      filtros={<FiltroFechas valor={rango} onChange={setRango} permitirTodo label="Fecha de ingreso" />}
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
              { label: 'Órdenes', valor: entero(k.totalOrdenes) },
              { label: 'Tipos de equipo', valor: entero(k.tiposDistintos) },
              { label: 'Más frecuente', valor: k.tipoMasFrecuente ?? '—' },
              { label: 'Mejor ticket', valor: k.tipoMejorTicket ?? '—', detalle: 'Mayor cobro promedio' },
              { label: 'Marca más frecuente', valor: k.marcaMasFrecuente ?? '—' },
            ]}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <Seccion titulo="Distribución de órdenes">
              <BarList
                items={data.detalle.map((t) => ({ etiqueta: t.tipoEquipo, valor: t.cantidad, texto: `${t.cantidad} (${porc(t.porcentaje)})` }))}
              />
            </Seccion>
            <Seccion titulo="Marcas más frecuentes">
              <BarList
                items={data.topMarcas.map((m) => ({
                  etiqueta: `${m.marca} · ${m.tipoEquipo}`,
                  valor: m.cantidad,
                  texto: `${m.cantidad} (${porc(m.porcentaje)})`,
                }))}
              />
            </Seccion>
          </div>

          <Seccion titulo="Rendimiento por tipo de equipo" descripcion="En ámbar: tasa de éxito menor al 70%.">
            <Tabla
              clave={(t) => t.tipoEquipo}
              filas={data.detalle}
              tono={(t) => (t.tasaExito !== null && t.tasaExito < 70 ? 'alerta' : undefined)}
              columnas={[
                { titulo: 'Tipo de equipo', render: (t) => t.tipoEquipo },
                { titulo: 'Órdenes', alinear: 'right', render: (t) => t.cantidad },
                { titulo: '%', alinear: 'right', render: (t) => porc(t.porcentaje) },
                { titulo: 'En curso', alinear: 'right', render: (t) => t.enCurso },
                { titulo: 'Entregadas', alinear: 'right', render: (t) => t.entregadas },
                { titulo: 'Fallidas', alinear: 'right', render: (t) => t.fallidas },
                { titulo: 'Éxito', alinear: 'right', render: (t) => porc(t.tasaExito) },
                { titulo: 'Tiempo prom.', alinear: 'right', render: (t) => dias(t.tiempoPromedio) },
                { titulo: 'Ticket prom.', alinear: 'right', render: (t) => bs(t.ticketPromedio) },
                { titulo: 'Facturado', alinear: 'right', render: (t) => bs(t.facturado) },
              ]}
              totales={[
                'Total',
                k.totalOrdenes,
                '100%',
                data.detalle.reduce((a, t) => a + t.enCurso, 0),
                data.detalle.reduce((a, t) => a + t.entregadas, 0),
                data.detalle.reduce((a, t) => a + t.fallidas, 0),
                '',
                '',
                '',
                bs(data.detalle.reduce((a, t) => a + t.facturado, 0)),
              ]}
            />
          </Seccion>
        </div>
      )}
    </ReporteShell>
  );
}
