import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { garantiasApi } from '../api/garantias';
import type { ChangeEstadoGarantiaPayload, CreateGarantiaPayload, GarantiasQuery } from '../../types/garantia';

export function useGarantias(query: GarantiasQuery) {
  return useQuery({
    queryKey: ['garantias', query],
    queryFn: () => garantiasApi.findAll(query),
    placeholderData: (prev) => prev,
  });
}

export function useGarantiaMutations(ordenId?: number) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['garantias'], exact: false });
    if (ordenId) {
      queryClient.invalidateQueries({ queryKey: ['reparaciones', 'detalle', ordenId] });
    }
  };

  const create = useMutation({
    mutationFn: (payload: CreateGarantiaPayload) => garantiasApi.create(payload),
    onSuccess: invalidate,
  });

  const changeEstado = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ChangeEstadoGarantiaPayload }) =>
      garantiasApi.changeEstado(id, payload),
    onSuccess: invalidate,
  });

  return { create, changeEstado };
}
