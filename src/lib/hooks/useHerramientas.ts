import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { herramientasApi } from '../api/herramientas';
import type {
  AsignarHerramientaPayload,
  ChangeEstadoHerramientaPayload,
  CreateHerramientaPayload,
  HerramientasQuery,
  UpdateHerramientaPayload,
} from '../../types/herramienta';

export function useHerramientas(query: HerramientasQuery) {
  return useQuery({
    queryKey: ['herramientas', query],
    queryFn: () => herramientasApi.findAll(query),
    placeholderData: (prev) => prev,
  });
}

export function useHerramienta(id: number) {
  return useQuery({
    queryKey: ['herramientas', 'detalle', id],
    queryFn: () => herramientasApi.findOne(id),
    enabled: !!id,
  });
}

export function useHerramientaMutations(id?: number) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['herramientas'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['herramientas-asignaciones'], exact: false });
  };

  const create = useMutation({
    mutationFn: (payload: CreateHerramientaPayload) => herramientasApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (payload: UpdateHerramientaPayload) => herramientasApi.update(id!, payload),
    onSuccess: invalidate,
  });

  const changeEstado = useMutation({
    mutationFn: (payload: ChangeEstadoHerramientaPayload) => herramientasApi.changeEstado(id!, payload),
    onSuccess: invalidate,
  });

  const asignar = useMutation({
    mutationFn: (payload: AsignarHerramientaPayload) => herramientasApi.asignar(id!, payload),
    onSuccess: invalidate,
  });

  const devolver = useMutation({
    mutationFn: (asignacionId: number) => herramientasApi.devolver(asignacionId),
    onSuccess: invalidate,
  });

  return { create, update, changeEstado, asignar, devolver };
}
