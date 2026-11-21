import { useState } from 'react';
import Badge from '../../ui/Badge';
import { useReporte } from '../../../../lib/hooks/useReportes';
import { estadoOrdenClasses, estadoOrdenLabel } from '../../../../lib/utils/estado';
import type { EstadoOrden } from '../../../../types/reporte';
import {
  BarList,
  FiltroEstados,
  FiltroSelect,
  KpiGrid,
  LinkOrden,
  ReporteShell,
  Seccion,
  Tabla,
  bs,
  dias,
  entero,
  fecha,
  pl,
  porc,
} from './compartido';

const ANTIGUEDAD = [
  { valor: '', etiqueta: 'Cualquiera' },
  { valor: '15', etiqueta: 'Más de 15 días' },
  { valor: '30', etiqueta: 'Más de 30 días' },
  { valor: '60', etiqueta: 'Más de 60 días' },
];

export default function CuentasPorCobrarReport() {
  const [estados, setEstados] = useState<EstadoOrden[]>([]);
  const [antiguedad, setAntiguedad] = useState('');
  const { data, isLoading, isFetching, error, pdf } = useReporte('cuentasPorCobrar', {
    estados,
    antiguedadMinima: antiguedad ? Number(antiguedad) : undefined,
  });
  const k = data?.kpis;

  return (
    <ReporteShell
      descripcion="Todo lo que los clientes deben al taller. Prioriza los equipos listos para entrega (cobrar al retirar) y, sobre todo, los ya entregados sin pagar por completo."
      filtros={
        <>
          <FiltroEstados valor={estados} onChange={setEstados} excluir={['CANCELADO', 'NO_REPARABLE']} />
          <FiltroSelect label="Antigüedad de la deuda" valor={antiguedad} onChange={setAntiguedad} opciones={ANTIGUEDAD} todos={null} />
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
              { label: 'Total por cobrar', valor: bs(k.totalPorCobrar), detalle: pl(k.ordenes, 'orden', 'órdenes'), tono: k.totalPorCobrar ? 'alerta' : 'bueno' },
              { label: 'Listas para entrega', valor: bs(k.montoListas), detalle: `${pl(k.listasConSaldo, 'orden', 'órdenes')}: cobrar al retirar`, tono: k.listasConSaldo ? 'alerta' : 'neutral' },
              { label: 'Entregadas sin pagar', valor: bs(k.montoEntregadas), detalle: `${pl(k.entregadasConSaldo, 'orden', 'órdenes')}: riesgo de no cobro`, tono: k.entregadasConSaldo ? 'malo' : 'bueno' },
              { label: 'Sin anticipo', valor: entero(k.sinAnticipo), detalle: 'No pagaron nada aún' },
              { label: 'Saldo promedio', valor: bs(k.saldoPromedio) },
            ]}
          />

          <Seccion titulo="Antigüedad de la deuda" descripcion="Días desde el ingreso del equipo hasta hoy.">
            <BarList
              items={data.porTramo.map((t) => ({ etiqueta: t.tramo, valor: t.saldo, texto: `${bs(t.saldo)} · ${pl(t.cantidad, 'orden', 'órdenes')}` }))}
              vacio="No hay saldos pendientes."
            />
          </Seccion>

          <Seccion
            titulo={`Detalle (${data.detalle.length})`}
            descripcion="De mayor a menor saldo. En rojo: entregadas sin pagar. En ámbar: listas para entrega."
          >
            <Tabla
              clave={(f) => f.ordenId}
              filas={data.detalle}
              vacio="No hay órdenes con saldo pendiente. ¡Todo cobrado!"
              tono={(f) => (f.estado === 'ENTREGADO' ? 'malo' : f.estado === 'LISTO_ENTREGA' ? 'alerta' : undefined)}
              columnas={[
                { titulo: 'Orden', render: (f) => <LinkOrden id={f.ordenId} codigo={f.codigoOrden} />, className: 'whitespace-nowrap' },
                { titulo: 'Estado', render: (f) => <Badge label={estadoOrdenLabel(f.estado)} className={estadoOrdenClasses(f.estado)} /> },
                { titulo: 'Cliente', render: (f) => (<><p>{f.cliente}</p><p className="text-xs text-graphite-400">{f.telefono}</p></>) },
                { titulo: 'Ingreso', render: (f) => fecha(f.fechaIngreso), className: 'whitespace-nowrap' },
                { titulo: 'Antigüedad', alinear: 'right', render: (f) => dias(f.antiguedad) },
                { titulo: 'Último pago', render: (f) => fecha(f.ultimoPago), className: 'whitespace-nowrap' },
                { titulo: 'Total', alinear: 'right', render: (f) => bs(f.total) },
                { titulo: 'Pagado', alinear: 'right', render: (f) => `${bs(f.pagado)} (${porc(f.porcentajePagado)})` },
                { titulo: 'Saldo', alinear: 'right', render: (f) => <span className="font-semibold">{bs(f.saldo)}</span> },
              ]}
              totales={[
                '',
                '',
                'Total',
                '',
                '',
                '',
                bs(data.detalle.reduce((a, f) => a + f.total, 0)),
                bs(data.detalle.reduce((a, f) => a + f.pagado, 0)),
                bs(k.totalPorCobrar),
              ]}
            />
          </Seccion>
        </div>
      )}
    </ReporteShell>
  );
}
