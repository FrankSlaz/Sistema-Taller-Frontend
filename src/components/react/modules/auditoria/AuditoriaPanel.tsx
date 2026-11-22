import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Monitor, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Badge from '../../ui/Badge';
import Pagination from '../../ui/Pagination';
import AccessDenied from '../../ui/AccessDenied';
import QueryProvider from '../../providers/QueryProvider';
import { auditoriaApi } from '../../../../lib/api/auditoria';
import { ApiError } from '../../../../lib/api/client';
import type { CambioAuditado, CampoCambiado, EventoAuditoria } from '../../../../types/auditoria';
import type { RangoFechas } from '../../../../types/reporte';
import { FiltroFechas, FiltroSelect, FiltroTexto, KpiGrid, entero, presetRango } from '../reportes/compartido';

const LIMIT = 25;

// ---------------------------------------------------------------------------
// Textos
// ---------------------------------------------------------------------------

const ACCIONES: Record<string, { etiqueta: string; clase: string }> = {
  CREAR: { etiqueta: 'Creación', clase: 'bg-green-50 text-green-700 ring-green-600/20' },
  EDITAR: { etiqueta: 'Edición', clase: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  CAMBIAR_ESTADO: { etiqueta: 'Cambio de estado', clase: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' },
  ELIMINAR: { etiqueta: 'Eliminación', clase: 'bg-red-50 text-red-700 ring-red-600/20' },
  ANULAR: { etiqueta: 'Anulación', clase: 'bg-red-50 text-red-700 ring-red-600/20' },
  LOGIN: { etiqueta: 'Inicio de sesión', clase: 'bg-graphite-50 text-graphite-600 ring-graphite-500/20' },
  LOGIN_FALLIDO: { etiqueta: 'Acceso fallido', clase: 'bg-amber-50 text-amber-800 ring-amber-600/30' },
  RESTAURAR: { etiqueta: 'Restauración', clase: 'bg-amber-50 text-amber-800 ring-amber-600/30' },
  DESCARGAR: { etiqueta: 'Descarga', clase: 'bg-graphite-50 text-graphite-600 ring-graphite-500/20' },
};
const accion = (a: string) => ACCIONES[a] ?? { etiqueta: a, clase: 'bg-graphite-50 text-graphite-600 ring-graphite-500/20' };

const MODULOS: Record<string, string> = {
  auth: 'Sesiones',
  reparaciones: 'Órdenes',
  diagnosticos: 'Diagnósticos',
  presupuestos: 'Presupuestos',
  'orden-repuestos': 'Repuestos usados',
  pagos: 'Pagos',
  entregas: 'Entregas',
  garantias: 'Garantías',
  comunicaciones: 'Comunicaciones',
  clientes: 'Clientes',
  equipos: 'Equipos',
  'archivos-equipo': 'Fotos y archivos',
  inventario: 'Inventario',
  productos: 'Productos',
  categorias: 'Categorías',
  'movimientos-inventario': 'Movimientos de inventario',
  compras: 'Compras',
  proveedores: 'Proveedores',
  herramientas: 'Herramientas',
  usuarios: 'Usuarios',
  roles: 'Roles y permisos',
  configuracion: 'Configuración',
  backups: 'Backups',
  'estados-orden': 'Estados de orden',
};
const modulo = (m: string | null) => (m ? (MODULOS[m] ?? m.charAt(0).toUpperCase() + m.slice(1)) : '—');

const ENTIDADES: Record<string, string> = {
  OrdenReparacion: 'Orden',
  Cliente: 'Cliente',
  Equipo: 'Equipo',
  ArchivoEquipo: 'Archivo',
  Usuario: 'Usuario',
  Rol: 'Rol',
  RolPermiso: 'Permiso del rol',
  Diagnostico: 'Diagnóstico',
  Presupuesto: 'Presupuesto',
  OrdenTecnico: 'Técnico asignado',
  OrdenRepuesto: 'Repuesto usado',
  PagoReparacion: 'Pago',
  Entrega: 'Entrega',
  Garantia: 'Garantía',
  ComunicacionCliente: 'Comunicación',
  CategoriaProducto: 'Categoría',
  Producto: 'Producto',
  Proveedor: 'Proveedor',
  Compra: 'Compra',
  DetalleCompra: 'Detalle de compra',
  MovimientoInventario: 'Movimiento de inventario',
  Herramienta: 'Herramienta',
  HerramientaAsignada: 'Herramienta asignada',
  Configuracion: 'Configuración',
};

/** Nombres de campos más comunes; el resto se arma a partir del nombre técnico. */
const CAMPOS: Record<string, string> = {
  estadoId: 'Estado',
  estado: 'Estado',
  clienteId: 'Cliente',
  equipoId: 'Equipo',
  ordenId: 'Orden',
  usuarioId: 'Usuario',
  rolId: 'Rol',
  productoId: 'Producto',
  permisoId: 'Permiso',
  codigoOrden: 'Código',
  prioridad: 'Prioridad',
  fallaReportada: 'Falla reportada',
  observaciones: 'Observaciones',
  costoManoObra: 'Mano de obra',
  totalRepuestos: 'Total repuestos',
  totalEstimado: 'Total estimado',
  total: 'Total',
  monto: 'Monto',
  metodoPago: 'Método de pago',
  referencia: 'Referencia',
  observacion: 'Observación',
  tipo: 'Tipo',
  anulado: 'Anulado',
  motivoAnulacion: 'Motivo de anulación',
  anuladoPorId: 'Anulado por',
  fechaAnulacion: 'Fecha de anulación',
  fechaIngreso: 'Fecha de ingreso',
  fechaPromesa: 'Fecha promesa',
  fechaEstimadaEntrega: 'Entrega estimada',
  fechaEntrega: 'Fecha de entrega',
  fechaInicio: 'Inicio',
  fechaFin: 'Fin',
  dias: 'Días',
  garantiaDias: 'Garantía (días)',
  garantiaCondiciones: 'Condiciones de garantía',
  garantiaDefinidaPorId: 'Garantía definida por',
  garantiaDefinidaEn: 'Garantía definida el',
  condiciones: 'Condiciones',
  descripcion: 'Descripción',
  nombre: 'Nombre',
  apellido: 'Apellido',
  email: 'Correo',
  telefono: 'Teléfono',
  direccion: 'Dirección',
  tipoDocumento: 'Tipo de documento',
  numeroDocumento: 'N.º de documento',
  passwordHash: 'Contraseña',
  nombreRecibe: 'Retiró',
  documentoRecibe: 'Documento de quien retira',
  usuarioEntregaId: 'Entregó',
  stockActual: 'Stock',
  stockMinimo: 'Stock mínimo',
  precioVenta: 'Precio de venta',
  precioCompra: 'Precio de compra',
  cantidad: 'Cantidad',
  precioUnitario: 'Precio unitario',
  subtotal: 'Subtotal',
  deletedAt: 'Eliminado',
  logo: 'Logo',
  nombreTaller: 'Nombre del taller',
};
const campoLegible = (c: string) =>
  CAMPOS[c] ??
  (() => {
    const t = c.replace(/Id$/, '').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    return t.charAt(0).toUpperCase() + t.slice(1);
  })();

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
function valorLegible(v: unknown, texto?: string): string {
  if (texto) return texto;
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Sí' : 'No';
  if (typeof v === 'string' && ISO.test(v)) {
    return new Date(v).toLocaleString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  if (typeof v === 'string' && /^[A-Z_]+$/.test(v)) return v.replace(/_/g, ' ').toLowerCase();
  return String(v);
}

const fechaHora = (iso: string) => {
  const d = new Date(iso);
  return {
    dia: d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }),
    hora: d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
  };
};
const nombreUsuario = (u: EventoAuditoria['usuario']) => (u ? [u.nombre, u.apellido].filter(Boolean).join(' ') : 'Sistema');

/** Navegador y sistema a partir del user-agent ("Chrome en Windows"). */
function dispositivo(ua: string | null) {
  if (!ua) return null;
  const nav = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : null;
  const so = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : null;
  return [nav, so].filter(Boolean).join(' en ') || null;
}

/** Descripción para registros viejos, que solo guardaban la ruta. */
function descripcionDe(e: EventoAuditoria) {
  if (e.descripcion) return e.descripcion;
  const verbo: Record<string, string> = {
    CREAR: 'Creó un registro',
    EDITAR: 'Editó un registro',
    ELIMINAR: 'Eliminó un registro',
    CAMBIAR_ESTADO: 'Cambió el estado de un registro',
    ANULAR: 'Anuló un registro',
    RESTAURAR: 'Restauró un backup',
  };
  return `${verbo[e.accion] ?? e.accion} en ${modulo(e.modulo)}${e.registroId ? ` (#${e.registroId})` : ''}`;
}

// ---------------------------------------------------------------------------
// Detalle de un evento
// ---------------------------------------------------------------------------

const OCULTAR_EN_DATOS = new Set(['id', 'createdAt', 'updatedAt', 'deletedAt', 'tokenSeguimiento', 'passwordHash']);

function TablaCampos({ campos }: { campos: CampoCambiado[] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left text-[11px] uppercase tracking-wide text-graphite-400">
          <th className="w-1/4 py-1 pr-3 font-semibold">Campo</th>
          <th className="py-1 pr-3 font-semibold">Antes</th>
          <th className="py-1 font-semibold">Después</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-graphite-100">
        {campos.map((c) => (
          <tr key={c.campo} className="align-top">
            <td className="py-1.5 pr-3 font-medium text-graphite-700">{campoLegible(c.campo)}</td>
            <td className="py-1.5 pr-3 text-red-700 line-through decoration-red-300">{valorLegible(c.antes, c.antesTexto)}</td>
            <td className="py-1.5 font-medium text-green-800">{valorLegible(c.despues, c.despuesTexto)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ListaDatos({ cambio }: { cambio: CambioAuditado }) {
  const filas = Object.entries(cambio.datos ?? {}).filter(([k, v]) => !OCULTAR_EN_DATOS.has(k) && v !== null && v !== '');
  if (!filas.length) return null;
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
      {filas.map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <dt className="shrink-0 text-graphite-400">{campoLegible(k)}:</dt>
          <dd className="min-w-0 break-words text-graphite-800">{valorLegible(v, cambio.textos?.[k])}</dd>
        </div>
      ))}
    </dl>
  );
}

const OPERACION: Record<string, { texto: string; clase: string }> = {
  CREAR: { texto: 'Creado', clase: 'text-green-700' },
  EDITAR: { texto: 'Modificado', clase: 'text-blue-700' },
  ELIMINAR: { texto: 'Eliminado', clase: 'text-red-700' },
};

function DetalleEvento({ evento }: { evento: EventoAuditoria }) {
  const cambios = evento.cambios ?? [];
  const equipo = dispositivo(evento.userAgent);

  return (
    <div className="space-y-3 border-t border-graphite-100 bg-graphite-50/60 px-4 py-3">
      {cambios.length === 0 ? (
        <p className="text-xs text-graphite-500">
          {evento.accion.startsWith('LOGIN')
            ? 'Evento de acceso al sistema.'
            : 'Registro anterior a la auditoría detallada: no tiene el detalle de los campos.'}
        </p>
      ) : (
        cambios.map((c, i) => {
          const op = OPERACION[c.operacion];
          return (
            <div key={i} className="rounded-md border border-graphite-200 bg-white p-3">
              <p className="mb-2 text-xs">
                <span className={`font-semibold ${op?.clase ?? ''}`}>{op?.texto ?? c.operacion}</span>
                <span className="text-graphite-500"> · {ENTIDADES[c.entidad] ?? c.entidad}</span>
                {c.etiqueta && <span className="font-medium text-graphite-900"> {c.etiqueta}</span>}
                {c.registroId && !c.etiqueta?.includes(String(c.registroId)) && (
                  <span className="text-graphite-400"> (#{c.registroId})</span>
                )}
              </p>
              {c.campos?.length ? <TablaCampos campos={c.campos} /> : <ListaDatos cambio={c} />}
            </div>
          );
        })
      )}
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-graphite-400">
        {evento.usuario?.email && <span>{evento.usuario.email}</span>}
        {evento.ip && <span>IP {evento.ip}</span>}
        {equipo && (
          <span className="inline-flex items-center gap-1">
            <Monitor size={11} />
            {equipo}
          </span>
        )}
        {evento.metodo && evento.ruta && (
          <span className="font-mono">
            {evento.metodo} /{evento.ruta}
          </span>
        )}
        <span>Evento #{evento.id}</span>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

function leerOrdenDeUrl(): { id: number; codigo: string } | null {
  if (typeof window === 'undefined') return null;
  const p = new URLSearchParams(window.location.search);
  const id = Number(p.get('ordenId'));
  return id ? { id, codigo: p.get('orden') ?? `#${id}` } : null;
}

function AuditoriaPanelContent() {
  const [orden, setOrden] = useState<{ id: number; codigo: string } | null>(null);
  const [rango, setRango] = useState<RangoFechas>(presetRango('7d'));
  const [usuarioId, setUsuarioId] = useState('');
  const [moduloSel, setModuloSel] = useState('');
  const [accionSel, setAccionSel] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [abiertos, setAbiertos] = useState<Set<number>>(new Set());

  // "Ver auditoría" desde una orden: muestra todo su historial.
  useEffect(() => {
    const o = leerOrdenDeUrl();
    if (o) {
      setOrden(o);
      setRango({});
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(busqueda.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [busqueda]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['auditoria', { rango, usuarioId, moduloSel, accionSel, search, page, orden: orden?.id }],
    queryFn: () =>
      auditoriaApi.findAll({
        ...rango,
        page,
        limit: LIMIT,
        usuarioId: usuarioId ? Number(usuarioId) : undefined,
        modulo: moduloSel || undefined,
        accion: accionSel || undefined,
        search: search || undefined,
        ordenId: orden?.id,
      }),
    placeholderData: (prev) => prev,
  });
  const { data: opciones } = useQuery({ queryKey: ['auditoria', 'opciones'], queryFn: auditoriaApi.opciones, retry: false });

  if (error instanceof ApiError && error.statusCode === 403) {
    return <AccessDenied message="La auditoría solo está disponible para el rol Administrador." />;
  }

  const cambiar =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(1);
    };
  const alternar = (id: number) =>
    setAbiertos((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  const quitarOrden = () => {
    setOrden(null);
    setRango(presetRango('7d'));
    setPage(1);
    window.history.replaceState(null, '', '/auditoria');
  };
  const resumen = data?.resumen;

  return (
    <div className="space-y-5">
      {orden && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          <span>
            Mostrando todo lo ocurrido en la orden{' '}
            <a href={`/reparaciones/${orden.id}`} className="font-semibold underline">
              {orden.codigo}
            </a>
          </span>
          <button type="button" onClick={quitarOrden} className="inline-flex items-center gap-1 text-xs font-medium hover:underline">
            <X size={13} />
            Ver toda la auditoría
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <FiltroFechas valor={rango} onChange={cambiar(setRango)} permitirTodo />
        <FiltroSelect
          label="Usuario"
          valor={usuarioId}
          onChange={cambiar(setUsuarioId)}
          opciones={(opciones?.usuarios ?? []).map((u) => ({
            valor: String(u.id),
            etiqueta: [u.nombre, u.apellido].filter(Boolean).join(' '),
          }))}
        />
        <FiltroSelect
          label="Módulo"
          valor={moduloSel}
          onChange={cambiar(setModuloSel)}
          opciones={(opciones?.modulos ?? [])
            .map((m) => ({ valor: m, etiqueta: modulo(m) }))
            .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta))}
        />
        <FiltroSelect
          label="Acción"
          valor={accionSel}
          onChange={cambiar(setAccionSel)}
          opciones={(opciones?.acciones ?? []).map((a) => ({ valor: a, etiqueta: accion(a).etiqueta }))}
        />
        <FiltroTexto label="Buscar" valor={busqueda} onChange={setBusqueda} placeholder="Orden, cliente, descripción…" />
      </div>

      {resumen && (
        <KpiGrid
          kpis={[
            { label: 'Eventos', valor: entero(resumen.total) },
            { label: 'Usuarios', valor: entero(resumen.usuarios), detalle: 'con actividad en el período' },
            {
              label: 'Eliminaciones y anulaciones',
              valor: entero(resumen.eliminaciones),
              tono: resumen.eliminaciones > 0 ? 'alerta' : 'neutral',
            },
            {
              label: 'Accesos fallidos',
              valor: entero(resumen.accesosFallidos),
              detalle: 'contraseña o usuario incorrecto',
              tono: resumen.accesosFallidos > 0 ? 'malo' : 'neutral',
            },
          ]}
        />
      )}

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-graphite-100" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-graphite-200">
          {(data?.items ?? []).length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-graphite-400">No hay movimientos para los filtros seleccionados.</p>
          )}
          <ul className="divide-y divide-graphite-200 bg-white">
            {(data?.items ?? []).map((e) => {
              const abierto = abiertos.has(e.id);
              const { dia, hora } = fechaHora(e.fecha);
              const a = accion(e.accion);
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => alternar(e.id)}
                    aria-expanded={abierto}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-graphite-50"
                  >
                    <span className="mt-0.5 text-graphite-400">{abierto ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</span>
                    <span className="w-24 shrink-0 text-xs tabular-nums text-graphite-500 sm:w-28">
                      <span className="block font-medium text-graphite-800">{hora}</span>
                      {dia}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <Badge label={a.etiqueta} className={a.clase} />
                        <span className="text-xs text-graphite-400">{modulo(e.modulo)}</span>
                      </span>
                      <span className="mt-1 block text-sm text-graphite-900">{descripcionDe(e)}</span>
                      <span className="mt-0.5 block text-xs text-graphite-500">
                        {nombreUsuario(e.usuario)}
                        {e.usuario?.rol?.nombre && <span className="text-graphite-400"> · {e.usuario.rol.nombre}</span>}
                      </span>
                    </span>
                  </button>
                  {abierto && <DetalleEvento evento={e} />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {isFetching && !isLoading && <p className="text-xs text-graphite-400">Actualizando…</p>}

      {data && data.meta.totalPages > 1 && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} onPageChange={setPage} />
      )}
    </div>
  );
}

export default function AuditoriaPanel() {
  return (
    <QueryProvider>
      <AuditoriaPanelContent />
    </QueryProvider>
  );
}
