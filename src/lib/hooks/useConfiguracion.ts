import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { configuracionApi } from '../api/configuracion';
import type { UpdateConfiguracionPayload } from '../../types/configuracion';

export function useConfiguracion() {
  return useQuery({
    queryKey: ['configuracion'],
    queryFn: configuracionApi.get,
  });
}

export function useConfiguracionPublica() {
  return useQuery({
    queryKey: ['configuracion', 'publica'],
    queryFn: configuracionApi.publica,
  });
}

export function useUpdateConfiguracion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateConfiguracionPayload) => configuracionApi.update(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['configuracion'] }),
  });
}

/**
 * Subir/quitar logo. No hace falta invalidar: el llamador recarga la
 * página, porque el logo y el nombre se pintan en el servidor (navbar,
 * favicon, título) y solo se actualizan con un render nuevo.
 */
export function useLogoMutations() {
  const subir = useMutation({ mutationFn: (file: File) => configuracionApi.subirLogo(file) });
  const eliminar = useMutation({ mutationFn: () => configuracionApi.eliminarLogo() });
  return { subir, eliminar };
}
