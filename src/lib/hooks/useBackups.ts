import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backupsApi } from '../api/backups';

export function useBackups() {
  return useQuery({
    queryKey: ['backups'],
    queryFn: backupsApi.listar,
    retry: false,
  });
}

export function useBackupMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['backups'] });

  const crear = useMutation({ mutationFn: backupsApi.crear, onSuccess: invalidate });
  const subir = useMutation({ mutationFn: (file: File) => backupsApi.subir(file), onSuccess: invalidate });
  const descargar = useMutation({ mutationFn: (nombre: string) => backupsApi.descargar(nombre) });
  const eliminar = useMutation({ mutationFn: (nombre: string) => backupsApi.eliminar(nombre), onSuccess: invalidate });
  const restaurar = useMutation({
    mutationFn: ({ nombre, confirmacion }: { nombre: string; confirmacion: string }) =>
      backupsApi.restaurar(nombre, confirmacion),
    // Tras restaurar cambió TODA la base: se invalida todo lo cacheado.
    onSuccess: () => queryClient.invalidateQueries(),
  });

  return { crear, subir, descargar, eliminar, restaurar };
}
