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
} from './compartido';

export default function TecnicosReport() {
  const [rango, setRango] = useState<RangoFechas>(presetRango('mes'));
  const { data, isLoading, isFetching, error, pdf } = useReporte('tecnicos', rango);
  const k = data?.kpis;

  return (
    <ReporteShell
      descripcion="Productividad y efectividad de cada técnico: cuántas órdenes entrega, en cuánto tiempo, con qué tasa de éxito y cuánto factura. Útil para repartir la carga y reconocer el buen trabajo."
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
              { label: 'Técnicos', valor: entero(k.tecnicos) },
              { label: 'Entregadas', valor: entero(k.entregadas), tono: k.entregadas ? 'bueno' : 'neutral' },
              { label: 'En curso (hoy)', valor: entero(k.enCurso), detalle: 'Carga de trabajo actual' },
              { label: 'Facturación', valor: bs(k.facturacion), detalle: 'De órdenes entregadas' },
              { label: 'Tiempo promedio', valor: dias(k.tiempoPromedio), detalle: k.mejorTecnico ? `Más entregas: ${k.mejorTecnico}` : undefined },
            ]}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <Seccion titulo="Órdenes entregadas">
              <BarList
                items={data.detalle.map((t) => ({ etiqueta: t.nombre, valor: t.entregadas, texto: pl(t.entregadas, 'entregada', 'entregadas') }))}
                vacio="Ningún técnico entregó órdenes en este período."
              />
            </Seccion>
            <Seccion titulo="Carga actual (órdenes en curso)">
              <BarList
                items={data.detalle.map((t) => ({ etiqueta: t.nombre, valor: t.enCurso, texto: pl(t.enCurso, 'orden', 'órdenes') }))}
                vacio="No hay órdenes en curso asignadas."
              />
            </Seccion>
          </div>

          <Seccion
            titulo="Desempeño detallado"
            descripcion="Asignadas = órdenes ingresadas en el período. Éxito = entregadas / (entregadas + canceladas o no reparables)."
          >
            <Tabla
              clave={(t) => t.tecnicoId}
              filas={data.detalle}
              columnas={[
                { titulo: '#', alinear: 'right', render: (t) => data.detalle.indexOf(t) + 1 },
                { titulo: 'Técnico', render: (t) => (t.activo ? t.nombre : <span className="text-graphite-400">{t.nombre} (inactivo)</span>) },
                { titulo: 'Asignadas', alinear: 'right', render: (t) => t.asignadasPeriodo },
                { titulo: 'Entregadas', alinear: 'right', render: (t) => t.entregadas },
                { titulo: 'En curso', alinear: 'right', render: (t) => t.enCurso },
                { titulo: 'Fallidas', alinear: 'right', render: (t) => t.fallidas },
                { titulo: 'Éxito', alinear: 'right', render: (t) => porc(t.tasaExito) },
                { titulo: 'Tiempo prom.', alinear: 'right', render: (t) => dias(t.tiempoPromedio) },
                { titulo: 'Diagnósticos', alinear: 'right', render: (t) => t.diagnosticos },
                { titulo: 'Ticket prom.', alinear: 'right', render: (t) => bs(t.ticketPromedio) },
                { titulo: 'Facturación', alinear: 'right', render: (t) => bs(t.facturacion) },
              ]}
              totales={[
                '',
                'Total',
                data.detalle.reduce((a, t) => a + t.asignadasPeriodo, 0),
                k.entregadas,
                k.enCurso,
                data.detalle.reduce((a, t) => a + t.fallidas, 0),
                '',
                '',
                data.detalle.reduce((a, t) => a + t.diagnosticos, 0),
                '',
                bs(k.facturacion),
              ]}
            />
          </Seccion>
        </div>
      )}
    </ReporteShell>
  );
}
