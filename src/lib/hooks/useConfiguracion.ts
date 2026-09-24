import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { configuracionApi } from '../api/configuracion';
import type { UpdateConfiguracionPayload } from '../../types/configuracion';

export function useConfiguracion() {
  return useQuery({
    queryKey: ['configuracion'],
    queryFn: configuracionApi.get,
  });
}

export function useUpdateConfiguracion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateConfiguracionPayload) => configuracionApi.update(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['configuracion'] }),
  });
}
