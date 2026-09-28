import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { diagnosticosApi } from '../api/diagnosticos';
import type { CreateDiagnosticoPayload, DiagnosticosQuery, UpdateDiagnosticoPayload } from '../../types/diagnostico';

export function useDiagnosticos(query: DiagnosticosQuery) {
  return useQuery({
    queryKey: ['diagnosticos', query],
    queryFn: () => diagnosticosApi.findAll(query),
    placeholderData: (prev) => prev,
  });
}

export function useDiagnostico(id: number) {
  return useQuery({
    queryKey: ['diagnosticos', 'detalle', id],
    queryFn: () => diagnosticosApi.findOne(id),
    enabled: !!id,
  });
}

/**
 * Si se provee `ordenId`, además de invalidar el listado global de
 * diagnósticos invalida el detalle de esa orden (el panel embebido en
 * Reparaciones usa su propio useDiagnosticos({ordenId}), separado del
 * campo orden.diagnosticos que trae GET /reparaciones/:id).
 */
export function useDiagnosticoMutations(ordenId?: number) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['diagnosticos'], exact: false });
    if (ordenId) {
      queryClient.invalidateQueries({ queryKey: ['reparaciones', 'detalle', ordenId] });
    }
  };

  const create = useMutation({
    mutationFn: (payload: CreateDiagnosticoPayload) => diagnosticosApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateDiagnosticoPayload }) =>
      diagnosticosApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => diagnosticosApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
