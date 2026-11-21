import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { archivosApi } from '../api/archivos';
import type { UploadArchivosPayload } from '../../types/archivo';

export function useArchivos(equipoId: number, ordenId?: number) {
  return useQuery({
    queryKey: ['archivos', equipoId, ordenId ?? 'todas'],
    queryFn: () => archivosApi.findAll(equipoId, ordenId),
    enabled: !!equipoId,
  });
}

export function useArchivoMutations(equipoId: number) {
  const queryClient = useQueryClient();

  // Subir/borrar una foto cambia también la miniatura y el contador del
  // listado de Equipos (fotoPrincipalId / _count.archivos).
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['archivos', equipoId] });
    queryClient.invalidateQueries({ queryKey: ['equipos'], exact: false });
  };

  const upload = useMutation({
    mutationFn: (payload: UploadArchivosPayload) => archivosApi.upload(equipoId, payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, descripcion }: { id: number; descripcion: string }) => archivosApi.update(id, descripcion),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => archivosApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ['archivo-blob', id] });
      invalidate();
    },
  });

  return { upload, update, remove };
}
