import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { presupuestosApi } from '../api/presupuestos';
import type {
  ChangeEstadoPresupuestoPayload,
  CreatePresupuestoPayload,
  PresupuestosQuery,
  UpdatePresupuestoPayload,
} from '../../types/presupuesto';

export function usePresupuestos(query: PresupuestosQuery) {
  return useQuery({
    queryKey: ['presupuestos', query],
    queryFn: () => presupuestosApi.findAll(query),
    placeholderData: (prev) => prev,
  });
}

/**
 * Mutaciones de presupuestos. Si se provee `ordenId`, además de
 * invalidar el listado de presupuestos, invalida el detalle de esa
 * orden — necesario porque al aprobar un presupuesto el backend
 * sincroniza costoManoObra/totalRepuestos/total de la orden.
 */
export function usePresupuestoMutations(ordenId?: number) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['presupuestos'], exact: false });
    if (ordenId) {
      queryClient.invalidateQueries({ queryKey: ['reparaciones', 'detalle', ordenId] });
    }
  };

  const create = useMutation({
    mutationFn: (payload: CreatePresupuestoPayload) => presupuestosApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePresupuestoPayload }) =>
      presupuestosApi.update(id, payload),
    onSuccess: invalidate,
  });

  const changeEstado = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ChangeEstadoPresupuestoPayload }) =>
      presupuestosApi.changeEstado(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => presupuestosApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, changeEstado, remove };
}
