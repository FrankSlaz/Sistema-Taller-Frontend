import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reparacionesApi } from '../api/reparaciones';
import { diagnosticosApi, type CreateDiagnosticoPayload } from '../api/diagnosticos';
import type {
  AssignTecnicoPayload,
  ChangeEstadoPayload,
  CreateOrdenPayload,
  OrdenesQuery,
  UpdateOrdenPayload,
} from '../../types/reparacion';

export function useReparaciones(query: OrdenesQuery) {
  return useQuery({
    queryKey: ['reparaciones', query],
    queryFn: () => reparacionesApi.findAll(query),
    placeholderData: (prev) => prev,
  });
}

export function useReparacion(id: number) {
  return useQuery({
    queryKey: ['reparaciones', 'detalle', id],
    queryFn: () => reparacionesApi.findOne(id),
    enabled: !!id,
  });
}

export function useReparacionMutations(id?: number) {
  const queryClient = useQueryClient();

  const invalidateList = () => queryClient.invalidateQueries({ queryKey: ['reparaciones'], exact: false });
  const invalidateDetail = () => {
    if (id) queryClient.invalidateQueries({ queryKey: ['reparaciones', 'detalle', id] });
  };
  const invalidateAll = () => {
    invalidateList();
    invalidateDetail();
  };

  const create = useMutation({
    mutationFn: (payload: CreateOrdenPayload) => reparacionesApi.create(payload),
    onSuccess: invalidateList,
  });

  const update = useMutation({
    mutationFn: (payload: UpdateOrdenPayload) => reparacionesApi.update(id!, payload),
    onSuccess: invalidateAll,
  });

  const changeEstado = useMutation({
    mutationFn: (payload: ChangeEstadoPayload) => reparacionesApi.changeEstado(id!, payload),
    onSuccess: invalidateAll,
  });

  const assignTecnico = useMutation({
    mutationFn: (payload: AssignTecnicoPayload) => reparacionesApi.assignTecnico(id!, payload),
    onSuccess: invalidateDetail,
  });

  const removeTecnico = useMutation({
    mutationFn: (usuarioId: number) => reparacionesApi.removeTecnico(id!, usuarioId),
    onSuccess: invalidateDetail,
  });

  const remove = useMutation({
    mutationFn: (ordenId: number) => reparacionesApi.remove(ordenId),
    onSuccess: invalidateList,
  });

  const addDiagnostico = useMutation({
    mutationFn: (payload: CreateDiagnosticoPayload) => diagnosticosApi.create(payload),
    onSuccess: invalidateDetail,
  });

  return { create, update, changeEstado, assignTecnico, removeTecnico, remove, addDiagnostico };
}
