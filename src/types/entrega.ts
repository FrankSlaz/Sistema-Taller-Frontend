/**
 * Espejo de backend-nest/src/modules/entregas
 * Relación 1-1 con OrdenReparacion: solo GET y POST (sin PATCH/DELETE).
 * Al crearse, marca automáticamente la orden como ENTREGADO.
 */

export interface EntregaOrdenRef {
  id: number;
  codigoOrden: string;
}

export interface EntregaUsuarioRef {
  id: number;
  nombre: string;
  apellido?: string | null;
}

export interface Entrega {
  id: number;
  ordenId: number;
  orden?: EntregaOrdenRef;
  usuarioEntregaId?: number | null;
  usuarioEntrega?: EntregaUsuarioRef | null;
  nombreRecibe?: string | null;
  documentoRecibe?: string | null;
  observaciones?: string | null;
  fechaEntrega: string;
}

export interface CreateEntregaPayload {
  ordenId: number;
  usuarioEntregaId?: number;
  nombreRecibe?: string;
  documentoRecibe?: string;
  observaciones?: string;
}

export interface EntregasQuery {
  page?: number;
  limit?: number;
}
