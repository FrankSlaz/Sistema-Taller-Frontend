import { api, downloadFile } from './client';
import type { PaginatedResult } from '../../types/api';
import type {
  CajaResumen,
  CreateDevolucionPayload,
  CreatePagoPayload,
  Pago,
  PagosQuery,
  PagosResumen,
} from '../../types/pago';

/** items + meta, `caja` siempre y `resumen` cuando se filtra por orden. */
export type PagosResult = PaginatedResult<Pago> & { caja: CajaResumen; resumen?: PagosResumen };

function toQueryString(query: PagosQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

const numeroRecibo = (p: Pago) => `${p.tipo === 'DEVOLUCION' ? 'D' : 'R'}-${String(p.id).padStart(6, '0')}`;

export const pagosApi = {
  findAll: (query: PagosQuery = {}) => api.get<PagosResult>(`/pagos${toQueryString(query)}`),

  findOne: (id: number) => api.get<Pago>(`/pagos/${id}`),

  create: (payload: CreatePagoPayload) => api.post<Pago>('/pagos', payload),

  /** Devolver al cliente un saldo a favor. */
  devolver: (payload: CreateDevolucionPayload) => api.post<Pago>('/pagos/devolucion', payload),

  /** Anular con motivo (reemplaza al borrado). */
  anular: (id: number, motivo: string) => api.patch<Pago>(`/pagos/${id}/anular`, { motivo }),

  recibo: (pago: Pago) => downloadFile(`/pagos/${pago.id}/recibo`, `recibo-${numeroRecibo(pago)}.pdf`),

  numeroRecibo,
};
