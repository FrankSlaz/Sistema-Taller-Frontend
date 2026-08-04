const ESTADO_STYLES: Record<string, string> = {
  RECIBIDO: 'bg-graphite-100 text-graphite-700 ring-graphite-500/20',
  DIAGNOSTICO: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  ESPERANDO_APROBACION: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  EN_REPARACION: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  PRUEBAS: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  LISTO_ENTREGA: 'bg-green-50 text-green-700 ring-green-600/20',
  ENTREGADO: 'bg-graphite-100 text-graphite-500 ring-graphite-500/20',
  CANCELADO: 'bg-red-50 text-red-700 ring-red-600/20',
  NO_REPARABLE: 'bg-red-50 text-red-700 ring-red-600/20',
};

const ESTADO_LABELS: Record<string, string> = {
  RECIBIDO: 'Recibido',
  DIAGNOSTICO: 'Diagnóstico',
  ESPERANDO_APROBACION: 'Esperando aprobación',
  EN_REPARACION: 'En reparación',
  PRUEBAS: 'Pruebas',
  LISTO_ENTREGA: 'Listo para entrega',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
  NO_REPARABLE: 'No reparable',
};

export function estadoOrdenClasses(nombre: string): string {
  return ESTADO_STYLES[nombre] ?? 'bg-graphite-100 text-graphite-600 ring-graphite-500/20';
}

export function estadoOrdenLabel(nombre: string): string {
  return ESTADO_LABELS[nombre] ?? nombre;
}

const PRIORIDAD_STYLES: Record<string, string> = {
  BAJA: 'bg-graphite-100 text-graphite-600 ring-graphite-500/20',
  NORMAL: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  ALTA: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  URGENTE: 'bg-red-50 text-red-700 ring-red-600/20',
};

export function prioridadClasses(prioridad?: string | null): string {
  return PRIORIDAD_STYLES[prioridad ?? 'NORMAL'] ?? PRIORIDAD_STYLES.NORMAL;
}

const ESTADO_PRESUPUESTO_STYLES: Record<string, string> = {
  PENDIENTE: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  APROBADO: 'bg-green-50 text-green-700 ring-green-600/20',
  RECHAZADO: 'bg-red-50 text-red-700 ring-red-600/20',
};

const ESTADO_PRESUPUESTO_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
};

export function estadoPresupuestoClasses(estado: string): string {
  return ESTADO_PRESUPUESTO_STYLES[estado] ?? 'bg-graphite-100 text-graphite-600 ring-graphite-500/20';
}

export function estadoPresupuestoLabel(estado: string): string {
  return ESTADO_PRESUPUESTO_LABELS[estado] ?? estado;
}

export function stockClasses(stockActual: number, stockMinimo: number): string {
  if (stockActual <= 0) return 'bg-red-50 text-red-700 ring-red-600/20';
  if (stockActual <= stockMinimo) return 'bg-amber-50 text-amber-700 ring-amber-600/20';
  return 'bg-green-50 text-green-700 ring-green-600/20';
}

const TIPO_MOVIMIENTO_STYLES: Record<string, string> = {
  ENTRADA: 'bg-green-50 text-green-700 ring-green-600/20',
  SALIDA: 'bg-red-50 text-red-700 ring-red-600/20',
  AJUSTE: 'bg-blue-50 text-blue-700 ring-blue-600/20',
};

const TIPO_MOVIMIENTO_LABELS: Record<string, string> = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
  AJUSTE: 'Ajuste',
};

export function tipoMovimientoClasses(tipo: string): string {
  return TIPO_MOVIMIENTO_STYLES[tipo] ?? 'bg-graphite-100 text-graphite-600 ring-graphite-500/20';
}

export function tipoMovimientoLabel(tipo: string): string {
  return TIPO_MOVIMIENTO_LABELS[tipo] ?? tipo;
}
