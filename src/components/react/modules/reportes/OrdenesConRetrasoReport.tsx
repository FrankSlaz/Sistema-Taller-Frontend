import { useState } from 'react';
import Badge from '../../ui/Badge';
import { useReporte } from '../../../../lib/hooks/useReportes';
import { useTecnicos } from '../../../../lib/hooks/useReparaciones';
import { estadoOrdenClasses, estadoOrdenLabel } from '../../../../lib/utils/estado';
import type { FilaRetraso } from '../../../../types/reporte';
import {
  BarList,
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
  type Columna,
} from './compartido';

const PROXIMAS = [
  { valor: '0', etiqueta: 'No incluir' },
  { valor: '1', etiqueta: 'Mañana' },
  { valor: '3', etiqueta: 'Próximos 3 días' },
  { valor: '7', etiqueta: 'Próximos 7 días' },
];

export default function OrdenesConRetrasoReport() {
  const [tecnicoId, setTecnicoId] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [proximas, setProximas] = useState('3');
  const { data: tecnicos } = useTecnicos();

  const { data, isLoading, isFetching, error, pdf } = useReporte('ordenesConRetraso', {
    tecnicoId: tecnicoId ? Number(tecnicoId) : undefined,
    prioridad: prioridad || undefined,
    incluirProximas: proximas !== '0',
    diasProximas: proximas !== '0' ? Number(proximas) : undefined,
  });
  const k = data?.kpis;
  const retrasadas = data?.detalle.filter((f) => f.situacion === 'RETRASADA') ?? [];
  const porVencer = data?.detalle.filter((f) => f.situacion === 'POR_VENCER') ?? [];

  const columnas = (extra: Columna<FilaRetraso>): Columna<FilaRetraso>[] => [
    { titulo: 'Orden', render: (f) => <LinkOrden id={f.ordenId} codigo={f.codigoOrden} />, className: 'whitespace-nowrap' },
    extra,
    { titulo: 'Compromiso', render: (f) => fecha(f.fechaCompromiso), className: 'whitespace-nowrap' },
    { titulo: 'Estado', render: (f) => <Badge label={estadoOrdenLabel(f.estado)} className={estadoOrdenClasses(f.estado)} /> },
    { titulo: 'Cliente', render: (f) => (<><p>{f.cliente}</p><p className="text-xs text-graphite-400">{f.telefono}</p></>) },
    { titulo: 'Equipo', render: (f) => f.equipo },
    { titulo: 'Técnico', render: (f) => f.tecnicos },
    { titulo: 'En taller', alinear: 'right', render: (f) => dias(f.diasEnTaller) },
    { titulo: 'Saldo', alinear: 'right', render: (f) => bs(f.saldo) },
  ];

  return (
    <ReporteShell
      descripcion="Órdenes que pasaron la fecha comprometida con el cliente (fecha promesa o, si no hay, la estimada) y las que están por vencer. Ordenadas de mayor a menor retraso para saber a quién llamar primero."
      filtros={
        <>
          <FiltroSelect
            label="Técnico"
            valor={tecnicoId}
            onChange={setTecnicoId}
            opciones={(tecnicos ?? []).map((t) => ({ valor: String(t.id), etiqueta: `${t.nombre} ${t.apellido ?? ''}`.trim() }))}
          />
          <FiltroSelect label="Prioridad" valor={prioridad} onChange={setPrioridad} opciones={PRIORIDADES} todos="Todas" />
          <FiltroSelect label="Por vencer" valor={proximas} onChange={setProximas} opciones={PROXIMAS} todos={null} />
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
              { label: 'Retrasadas', valor: entero(k.retrasadas), tono: k.retrasadas ? 'malo' : 'bueno' },
              { label: 'Críticas (+7 días)', valor: entero(k.criticas), tono: k.criticas ? 'malo' : 'bueno' },
              { label: 'Retraso promedio', valor: dias(k.retrasoPromedio), detalle: `Máximo: ${dias(k.retrasoMaximo)}` },
              { label: 'Por vencer', valor: entero(k.porVencer), tono: k.porVencer ? 'alerta' : 'neutral' },
              { label: 'Valor comprometido', valor: bs(k.valorComprometido), detalle: 'Total de órdenes retrasadas' },
              { label: 'Sin fecha comprometida', valor: entero(k.sinFechaCompromiso), detalle: 'Órdenes activas: conviene definirla', tono: k.sinFechaCompromiso ? 'alerta' : 'neutral' },
            ]}
          />

          <Seccion titulo="Antigüedad del retraso">
            <BarList
              items={data.porTramo.map((t) => ({ etiqueta: t.tramo, valor: t.cantidad, texto: `${pl(t.cantidad, 'orden', 'órdenes')} · ${bs(t.valor)}` }))}
              vacio="No hay órdenes retrasadas."
            />
          </Seccion>

          <Seccion titulo={`Retrasadas (${retrasadas.length})`} descripcion="Contactar al cliente y reprogramar.">
            <Tabla
              clave={(f) => f.ordenId}
              filas={retrasadas}
              vacio="Ninguna orden pasó su fecha de entrega. ¡Bien!"
              tono={(f) => (f.diasRetraso > 7 ? 'malo' : 'alerta')}
              columnas={columnas({ titulo: 'Retraso', alinear: 'right', render: (f) => <span className="font-semibold">{dias(f.diasRetraso)}</span> })}
            />
          </Seccion>

          {proximas !== '0' && (
            <Seccion titulo={`Por vencer (${porVencer.length})`} descripcion="Priorizarlas para no incumplir.">
              <Tabla
                clave={(f) => f.ordenId}
                filas={porVencer}
                vacio="No hay entregas comprometidas para esos días."
                columnas={columnas({
                  titulo: 'Vence',
                  alinear: 'right',
                  render: (f) => (f.diasRetraso === 0 ? 'Hoy' : `en ${dias(-f.diasRetraso)}`),
                })}
              />
            </Seccion>
          )}
        </div>
      )}
    </ReporteShell>
  );
}
