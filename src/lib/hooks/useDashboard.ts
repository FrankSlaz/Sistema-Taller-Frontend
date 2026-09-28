import { useQuery } from '@tanstack/react-query';
import { reparacionesApi } from '../api/reparaciones';
import { productosApi } from '../api/productos';
import { herramientasApi } from '../api/herramientas';
import { garantiasApi } from '../api/garantias';
import { reportesApi } from '../api/reportes';
import { useAuth } from './useAuth';
import { useEstadosOrden } from './useEstadosOrden';

function primerDiaDelMes(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Cada indicador se pide solo si el usuario tiene el permiso de
 * lectura correspondiente (`enabled`), para no disparar peticiones
 * que sabemos de antemano que van a volver 403.
 */
export function useDashboardOrdenes() {
  const { hasPermiso } = useAuth();
  const puedeVer = hasPermiso('reparaciones:ver');

  // Los ids de estados_orden dependen del seed, no se asumen fijos:
  // se resuelven por nombre contra el catálogo real.
  const { data: estados } = useEstadosOrden();
  const idPor = (nombre: string) => estados?.find((e) => e.nombre === nombre)?.id;

  const idRecibido = idPor('RECIBIDO');
  const idListoEntrega = idPor('LISTO_ENTREGA');
  const idEntregado = idPor('ENTREGADO');
  const idCancelado = idPor('CANCELADO');
  const idNoReparable = idPor('NO_REPARABLE');

  const estadosListos = !!(idRecibido && idListoEntrega && idEntregado && idCancelado && idNoReparable);

  const total = useQuery({
    queryKey: ['dashboard', 'ordenes-total'],
    queryFn: () => reparacionesApi.findAll({ limit: 1 }),
    enabled: puedeVer,
  });

  // No hay filtro "estado NOT IN (...)" en la API: para "activas" se
  // resta del total las 3 que sí son estados terminales.
  const entregadas = useQuery({
    queryKey: ['dashboard', 'ordenes-entregadas', idEntregado],
    queryFn: () => reparacionesApi.findAll({ estadoId: idEntregado, limit: 1 }),
    enabled: puedeVer && estadosListos,
  });
  const canceladas = useQuery({
    queryKey: ['dashboard', 'ordenes-canceladas', idCancelado],
    queryFn: () => reparacionesApi.findAll({ estadoId: idCancelado, limit: 1 }),
    enabled: puedeVer && estadosListos,
  });
  const noReparables = useQuery({
    queryKey: ['dashboard', 'ordenes-no-reparables', idNoReparable],
    queryFn: () => reparacionesApi.findAll({ estadoId: idNoReparable, limit: 1 }),
    enabled: puedeVer && estadosListos,
  });

  const recibidas = useQuery({
    queryKey: ['dashboard', 'ordenes-recibidas', idRecibido],
    queryFn: () => reparacionesApi.findAll({ estadoId: idRecibido, limit: 1 }),
    enabled: puedeVer && estadosListos,
  });
  const listasEntrega = useQuery({
    queryKey: ['dashboard', 'ordenes-listas-entrega', idListoEntrega],
    queryFn: () => reparacionesApi.findAll({ estadoId: idListoEntrega, limit: 1 }),
    enabled: puedeVer && estadosListos,
  });
  const urgentes = useQuery({
    queryKey: ['dashboard', 'ordenes-urgentes'],
    queryFn: () => reparacionesApi.findAll({ prioridad: 'URGENTE', limit: 1 }),
    enabled: puedeVer,
  });

  const isLoading =
    total.isLoading || entregadas.isLoading || canceladas.isLoading || noReparables.isLoading;

  const activas =
    total.data && entregadas.data && canceladas.data && noReparables.data
      ? total.data.meta.total -
        entregadas.data.meta.total -
        canceladas.data.meta.total -
        noReparables.data.meta.total
      : undefined;

  return {
    puedeVer,
    isLoading,
    activas,
    recibidas: recibidas.data?.meta.total,
    listasEntrega: listasEntrega.data?.meta.total,
    urgentes: urgentes.data?.meta.total,
  };
}

export function useDashboardStockBajo() {
  const { hasPermiso } = useAuth();
  const puedeVer = hasPermiso('inventario:ver');

  const query = useQuery({
    queryKey: ['dashboard', 'stock-bajo'],
    queryFn: () => productosApi.findAll({ stockBajo: true, limit: 1 }),
    enabled: puedeVer,
  });

  return { puedeVer, isLoading: query.isLoading, total: query.data?.meta.total };
}

export function useDashboardHerramientasPrestadas() {
  const { hasPermiso } = useAuth();
  const puedeVer = hasPermiso('herramientas:ver');

  const query = useQuery({
    queryKey: ['dashboard', 'herramientas-asignadas'],
    queryFn: () => herramientasApi.findAll({ estado: 'ASIGNADA', limit: 1 }),
    enabled: puedeVer,
  });

  return { puedeVer, isLoading: query.isLoading, total: query.data?.meta.total };
}

/**
 * GarantiasQuery no admite filtrar por estado en el backend, así que
 * esto trae hasta 100 y cuenta ACTIVA en el cliente — aproximado si
 * hay más de 100 garantías en total, pero suficiente para un
 * indicador de dashboard (no es un reporte contable).
 */
export function useDashboardGarantiasActivas() {
  const { hasPermiso } = useAuth();
  const puedeVer = hasPermiso('garantias:ver');

  const query = useQuery({
    queryKey: ['dashboard', 'garantias-activas'],
    queryFn: () => garantiasApi.findAll({ limit: 100 }),
    enabled: puedeVer,
  });

  const total = query.data?.items.filter((g) => g.estado === 'ACTIVA').length;

  return { puedeVer, isLoading: query.isLoading, total, esAproximado: (query.data?.meta.total ?? 0) > 100 };
}

/**
 * Los reportes están protegidos con @Roles('Administrador') clásico,
 * no con el sistema de permisos dinámicos — igual que en Reportes y
 * Configuración, se gatea por rolNombre, no por hasPermiso.
 */
export function useDashboardIngresosDelMes() {
  const { rolNombre } = useAuth();
  const esAdmin = rolNombre === 'Administrador';

  const query = useQuery({
    queryKey: ['dashboard', 'ingresos-mes'],
    queryFn: () => reportesApi.ingresos({ fechaInicio: primerDiaDelMes(), fechaFin: hoyISO() }),
    enabled: esAdmin,
  });

  return { puedeVer: esAdmin, isLoading: query.isLoading, totalIngresos: query.data?.totalIngresos };
}
