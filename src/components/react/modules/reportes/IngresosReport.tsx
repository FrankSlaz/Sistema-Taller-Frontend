import { useState } from 'react';
import { useReporte } from '../../../../lib/hooks/useReportes';
import type { RangoFechas } from '../../../../types/reporte';
import {
  BarList,
  FiltroFechas,
  FiltroSelect,
  KpiGrid,
  LinkOrden,
  ReporteShell,
  Seccion,
  Tabla,
  bs,
  entero,
  fecha,
  pl,
  porc,
  presetRango,
  tonoVariacion,
  variacionTexto,
} from './compartido';

const METODOS = ['EFECTIVO', 'TRANSFERENCIA', 'QR'].map((m) => ({ valor: m, etiqueta: m }));

export default function IngresosReport() {
  const [rango, setRango] = useState<RangoFechas>(presetRango('mes'));
  const [metodoPago, setMetodoPago] = useState('');
  const { data, isLoading, isFetching, error, pdf } = useReporte('ingresos', {
    ...rango,
    metodoPago: metodoPago || undefined,
  });
  const k = data?.kpis;

  return (
    <ReporteShell
      descripcion="Cuánto cobró el taller, cómo se compara con el período anterior, por qué medios y con qué margen en repuestos. Incluye lo que todavía falta cobrar."
      filtros={
        <>
          <FiltroFechas valor={rango} onChange={setRango} />
          <FiltroSelect label="Método de pago" valor={metodoPago} onChange={setMetodoPago} opciones={METODOS} />
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
              { label: 'Total cobrado', valor: bs(k.totalIngresos), detalle: variacionTexto(k.variacionVsAnterior), tono: tonoVariacion(k.variacionVsAnterior) },
              { label: 'Pagos recibidos', valor: entero(k.totalPagos), detalle: pl(k.ordenesCobradas, 'orden', 'órdenes') },
              { label: 'Ticket promedio', valor: bs(k.ticketPromedio), detalle: 'Cobrado por orden' },
              { label: 'Promedio diario', valor: bs(k.promedioDiario) },
              { label: 'Período anterior', valor: bs(k.totalPeriodoAnterior) },
              {
                label: 'Margen en repuestos',
                valor: bs(data.repuestos.margen),
                detalle: data.repuestos.unidades ? `${porc(data.repuestos.margenPorcentaje)} sobre venta de ${bs(data.repuestos.venta)}` : 'Sin repuestos usados',
                tono: data.repuestos.margen < 0 ? 'malo' : 'neutral',
              },
              { label: 'Por cobrar (hoy)', valor: bs(k.saldoPorCobrar), detalle: pl(k.ordenesConSaldo, 'orden con saldo', 'órdenes con saldo'), tono: k.saldoPorCobrar ? 'alerta' : 'bueno' },
            ]}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <Seccion titulo="Por método de pago">
              <BarList
                items={data.porMetodoPago.map((m) => ({
                  etiqueta: m.metodoPago,
                  valor: m.totalMonto,
                  texto: `${bs(m.totalMonto)} · ${porc(m.porcentaje)}`,
                }))}
                vacio="No hay cobros en este período."
              />
            </Seccion>
            <Seccion
              titulo={data.filtros.granularidad === 'mes' ? 'Evolución mensual' : 'Evolución diaria'}
              descripcion="Solo días/meses con cobros"
            >
              <BarList
                items={data.evolucion.map((e) => ({ etiqueta: e.periodo, valor: e.total, texto: bs(e.total) }))}
                vacio="No hay cobros en este período."
              />
            </Seccion>
          </div>

          <Seccion titulo={`Detalle de pagos (${data.detalle.length})`}>
            <Tabla
              clave={(_p, i) => i}
              filas={data.detalle}
              vacio="No hay pagos registrados en este período."
              columnas={[
                { titulo: 'Fecha', render: (p) => fecha(p.fecha), className: 'whitespace-nowrap' },
                { titulo: 'Orden', render: (p) => <LinkOrden id={p.ordenId} codigo={p.codigoOrden} /> },
                { titulo: 'Cliente', render: (p) => p.cliente },
                { titulo: 'Método', render: (p) => p.metodoPago },
                { titulo: 'Referencia', render: (p) => p.referencia || '—' },
                { titulo: 'Monto', alinear: 'right', render: (p) => bs(p.monto) },
              ]}
              totales={['', '', '', '', 'Total', bs(k.totalIngresos)]}
            />
          </Seccion>
        </div>
      )}
    </ReporteShell>
  );
}
