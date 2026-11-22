/**
 * Espejo de backend-nest/src/modules/dashboard (GET /dashboard). Cada
 * bloque es null cuando el rol o los permisos no lo incluyen.
 */
export type PerfilInicio = 'admin' | 'recepcion' | 'tecnico' | 'general';

export interface ItemOrden {
  id: number;
  codigoOrden: string;
  cliente: string;
  telefono: string | null;
  equipo: string;
  estado: string;
  prioridad: string | null;
  fechaPromesa: string | null;
  dias?: number;
  saldo?: number;
  monto?: number;
}

export interface Lista<T> {
  total: number;
  items: T[];
}

export interface ProductoBajo {
  id: number;
  nombre: string;
  codigo: string | null;
  stockActual: number | null;
  stockMinimo: number | null;
}

export interface Inicio {
  perfil: PerfilInicio;
  generado: string;
  umbrales: { diasSinRetirar: number; diasSinRespuesta: number };
  hoy: {
    ingresadas: number;
    entregadas: number;
    caja: {
      neto: number;
      ingresos: number;
      devoluciones: number;
      movimientos: number;
      porMetodo: { metodo: string; monto: number }[];
    } | null;
  } | null;
  atencion: {
    sinRetirar: Lista<ItemOrden> | null;
    promesaVencida: Lista<ItemOrden> | null;
    presupuestosSinRespuesta: Lista<ItemOrden> | null;
    urgentesSinTecnico: Lista<ItemOrden> | null;
    garantiasPorVencer: Lista<ItemOrden> | null;
    stockBajo: Lista<ProductoBajo> | null;
  };
  mias: (Lista<ItemOrden> & { porDiagnosticar: number }) | null;
  embudo: {
    total: number;
    estados: { estadoId: number; estado: string; etiqueta: string; cantidad: number }[];
  } | null;
  tendencia: { dias: { fecha: string; neto: number }[]; total: number } | null;
  mes: {
    ingresos: number;
    ingresadas: number;
    entregadas: number;
    porCobrar: number;
    ordenesConSaldo: number;
  } | null;
  herramientasPrestadas: number | null;
}
