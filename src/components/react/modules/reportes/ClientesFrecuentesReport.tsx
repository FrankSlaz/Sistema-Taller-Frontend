import { useState } from 'react';
import { useReporte } from '../../../../lib/hooks/useReportes';
import type { RangoFechas } from '../../../../types/reporte';
import {
  FiltroFechas,
  FiltroSelect,
  KpiGrid,
  ReporteShell,
  Seccion,
  Tabla,
  bs,
  dias,
  entero,
  fecha,
  porc,
} from './compartido';

const MINIMOS = [1, 2, 3, 5, 10].map((n) => ({ valor: String(n), etiqueta: n === 1 ? 'Todos los clientes' : `${n} o más órdenes` }));

export default function ClientesFrecuentesReport() {
  const [rango, setRango] = useState<RangoFechas>({});
  const [minOrdenes, setMinOrdenes] = useState('2');
  const { data, isLoading, isFetching, error, pdf } = useReporte('clientesFrecuentes', {
    ...rango,
    minOrdenes: Number(minOrdenes),
  });
  const k = data?.kpis;

  return (
    <ReporteShell
      descripcion="Los clientes que vuelven, cuánto aportan y si deben algo. “Sin volver” indica hace cuánto no traen un equipo: ideal para recordatorios, promociones y fidelización."
      filtros={
        <>
          <FiltroFechas valor={rango} onChange={setRango} permitirTodo />
          <FiltroSelect label="Clientes" valor={minOrdenes} onChange={setMinOrdenes} opciones={MINIMOS} todos={null} />
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
              { label: 'Clientes atendidos', valor: entero(k.clientesAtendidos) },
              { label: 'Recurrentes', valor: entero(k.clientesRecurrentes), detalle: `${porc(k.tasaRecurrencia)} de los clientes`, tono: k.clientesRecurrentes ? 'bueno' : 'neutral' },
              { label: 'Facturación recurrentes', valor: bs(k.facturacionRecurrentes), detalle: `${porc(k.participacionFacturacion)} del total facturado` },
              { label: 'Órdenes por cliente', valor: k.ordenesPorCliente.toLocaleString('es-BO'), detalle: 'Promedio' },
            ]}
          />

          <Seccion titulo={`Ranking de clientes (${data.detalle.length})`} descripcion="En ámbar: tiene saldo pendiente.">
            <Tabla
              clave={(c) => c.clienteId}
              filas={data.detalle}
              vacio="Aún no hay clientes que cumplan el mínimo de órdenes."
              tono={(c) => (c.saldo > 0 ? 'alerta' : undefined)}
              columnas={[
                { titulo: '#', alinear: 'right', render: (c) => data.detalle.indexOf(c) + 1 },
                {
                  titulo: 'Cliente',
                  render: (c) => (
                    <a href={`/reparaciones?clienteId=${c.clienteId}`} className="text-graphite-900 hover:underline">
                      {c.nombre}
                    </a>
                  ),
                },
                { titulo: 'Teléfono', render: (c) => c.telefono, className: 'whitespace-nowrap' },
                { titulo: 'Órdenes', alinear: 'right', render: (c) => c.totalOrdenes },
                { titulo: 'Equipos', alinear: 'right', render: (c) => c.equiposDistintos },
                { titulo: 'Facturado', alinear: 'right', render: (c) => bs(c.facturado) },
                { titulo: 'Ticket prom.', alinear: 'right', render: (c) => bs(c.ticketPromedio) },
                { titulo: 'Saldo', alinear: 'right', render: (c) => bs(c.saldo) },
                { titulo: 'Última visita', render: (c) => fecha(c.ultimaVisita), className: 'whitespace-nowrap' },
                { titulo: 'Sin volver', alinear: 'right', render: (c) => dias(c.diasSinVolver) },
              ]}
              totales={[
                '',
                'Total',
                '',
                data.detalle.reduce((a, c) => a + c.totalOrdenes, 0),
                '',
                bs(data.detalle.reduce((a, c) => a + c.facturado, 0)),
                '',
                bs(data.detalle.reduce((a, c) => a + c.saldo, 0)),
                '',
                '',
              ]}
            />
          </Seccion>
        </div>
      )}
    </ReporteShell>
  );
}
