import { useState } from 'react';
import Badge from '../../ui/Badge';
import { useReporte } from '../../../../lib/hooks/useReportes';
import { useTecnicos } from '../../../../lib/hooks/useReparaciones';
import { estadoOrdenClasses, estadoOrdenLabel } from '../../../../lib/utils/estado';
import type { EstadoOrden, RangoFechas } from '../../../../types/reporte';
import {
  BarList,
  FiltroEstados,
  FiltroFechas,
  FiltroSelect,
  KpiGrid,
  LinkOrden,
  PRIORIDADES,
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

export default function ReparacionesPorEstadoReport() {
  const [rango, setRango] = useState<RangoFechas>({});
  const [estados, setEstados] = useState<EstadoOrden[]>([]);
  const [tecnicoId, setTecnicoId] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const { data: tecnicos } = useTecnicos();

  const query = {
    ...rango,
    estados,
    tecnicoId: tecnicoId ? Number(tecnicoId) : undefined,
    prioridad: prioridad || undefined,
  };
  const { data, isLoading, isFetching, error, pdf } = useReporte('reparacionesPorEstado', query);
  const k = data?.kpis;

  return (
    <ReporteShell
      descripcion="En qué etapa está cada orden y cuáles requieren acción. Filtra por uno o varios estados (por ejemplo, solo “En diagnóstico” o todas las pendientes) para imprimir exactamente esa lista."
      filtros={
        <>
          <FiltroEstados valor={estados} onChange={setEstados} />
          <FiltroFechas valor={rango} onChange={setRango} permitirTodo label="Fecha de ingreso" />
          <FiltroSelect
            label="Técnico"
            valor={tecnicoId}
            onChange={setTecnicoId}
            opciones={(tecnicos ?? []).map((t) => ({ valor: String(t.id), etiqueta: `${t.nombre} ${t.apellido ?? ''}`.trim() }))}
          />
          <FiltroSelect label="Prioridad" valor={prioridad} onChange={setPrioridad} opciones={PRIORIDADES} todos="Todas" />
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
              { label: 'Órdenes', valor: entero(k.totalOrdenes) },
              { label: 'En taller', valor: entero(k.activas), detalle: `${entero(k.atrasadas)} con retraso`, tono: k.atrasadas ? 'alerta' : 'neutral' },
              { label: 'Entregadas', valor: entero(k.entregadas), tono: k.entregadas ? 'bueno' : 'neutral' },
              { label: 'Tasa de éxito', valor: porc(k.tasaExito), detalle: pl(k.fallidas, 'cancelada / no reparable', 'canceladas / no reparables'), tono: k.tasaExito !== null && k.tasaExito < 80 ? 'alerta' : 'neutral' },
              { label: 'Tiempo prom. reparación', valor: dias(k.tiempoPromedioReparacion) },
              { label: 'Valor en proceso', valor: bs(k.valorEnProceso), detalle: 'Total de órdenes aún en taller' },
              { label: 'Saldo pendiente', valor: bs(k.saldoPendiente), tono: k.saldoPendiente ? 'alerta' : 'neutral' },
            ]}
          />

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Seccion titulo="Distribución por estado">
                <BarList
                  items={data.porEstado.map((e) => ({
                    etiqueta: e.etiqueta,
                    valor: e.cantidad,
                    texto: `${e.cantidad} (${porc(e.porcentaje)})`,
                  }))}
                  vacio="No hay órdenes para los filtros elegidos."
                />
              </Seccion>
            </div>
            <div className="lg:col-span-3">
              <Seccion titulo="Resumen por estado">
                <Tabla
                  clave={(e) => e.estado}
                  filas={data.porEstado}
                  columnas={[
                    { titulo: 'Estado', render: (e) => e.etiqueta },
                    { titulo: 'Órdenes', alinear: 'right', render: (e) => e.cantidad },
                    { titulo: 'Días prom.', alinear: 'right', render: (e) => dias(e.diasPromedio) },
                    { titulo: 'Valor', alinear: 'right', render: (e) => bs(e.valor) },
                    { titulo: 'Saldo', alinear: 'right', render: (e) => bs(e.saldo) },
                  ]}
                  totales={[
                    'Total',
                    k.totalOrdenes,
                    '',
                    bs(data.porEstado.reduce((a, e) => a + e.valor, 0)),
                    bs(data.porEstado.reduce((a, e) => a + e.saldo, 0)),
                  ]}
                />
              </Seccion>
            </div>
          </div>

          <Seccion
            titulo={`Detalle de órdenes (${data.detalle.length})`}
            descripcion="En rojo: pasó la fecha comprometida. En ámbar: prioridad urgente. Haz clic en el código para abrir la orden."
          >
            <Tabla
              clave={(f) => f.ordenId}
              filas={data.detalle}
              tono={(f) => (f.atrasada ? 'malo' : f.prioridad === 'URGENTE' ? 'alerta' : undefined)}
              columnas={[
                { titulo: 'Orden', render: (f) => <LinkOrden id={f.ordenId} codigo={f.codigoOrden} />, className: 'whitespace-nowrap' },
                { titulo: 'Estado', render: (f) => <Badge label={estadoOrdenLabel(f.estado)} className={estadoOrdenClasses(f.estado)} /> },
                { titulo: 'Ingreso', render: (f) => fecha(f.fechaIngreso), className: 'whitespace-nowrap' },
                { titulo: 'Cliente', render: (f) => (<><p>{f.cliente}</p><p className="text-xs text-graphite-400">{f.telefono}</p></>) },
                { titulo: 'Equipo', render: (f) => f.equipo },
                { titulo: 'Técnico', render: (f) => f.tecnicos },
                { titulo: 'Días', alinear: 'right', render: (f) => f.diasEnTaller },
                { titulo: 'Compromiso', render: (f) => fecha(f.fechaCompromiso), className: 'whitespace-nowrap' },
                { titulo: 'Total', alinear: 'right', render: (f) => bs(f.total) },
                { titulo: 'Saldo', alinear: 'right', render: (f) => bs(f.saldo) },
              ]}
            />
          </Seccion>
        </div>
      )}
    </ReporteShell>
  );
}
