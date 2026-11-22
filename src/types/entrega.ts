/**
 * Espejo de backend-nest/src/modules/entregas
 * Entrega con control: solo desde "Listo para entrega" (o devolución de
 * cancelada / no reparable), saldo en cero, quién retira obligatorio y
 * garantía automática. Se puede anular si fue un error.
 */

export interface EntregaUsuarioRef {
  id: number;
  nombre: string;
  apellido?: string | null;
}

export interface EntregaOrdenRef {
  id: number;
  codigoOrden: string;
  cliente?: { nombre: string; telefono?: string | null };
  equipo?: { tipoEquipo: string; marca?: string | null; modelo?: string | null };
  estado?: { nombre: string };
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
  nombreRecibe: string;
  documentoRecibe: string;
  observaciones?: string;
}

/** Respuesta de POST /entregas. */
export interface EntregaCreada extends Entrega {
  garantia: { id: number; dias: number; fechaFin: string } | null;
  /** true si fue devolución sin reparar (cancelada / no reparable). */
  devolucion: boolean;
}

export interface EntregasQuery {
  page?: number;
  limit?: number;
  search?: string;
}
