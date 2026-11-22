import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '../api/categorias';
import type { CategoriaPayload } from '../../types/categoria';
import type { FiltroActivo } from '../../components/react/ui/Activacion';

/** Por defecto solo activas (para elegir); 'todos' para gestionar o filtrar. */
export function useCategorias(estado?: FiltroActivo) {
  return useQuery({
    queryKey: ['categorias-producto', estado ?? 'activos'],
    queryFn: () => categoriasApi.findAll(estado),
  });
}

export function useCategoriaMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['categorias-producto'] });
    // Los productos embeben { categoria: { nombre } }; si el nombre cambia,
    // hay que refrescar también su listado para que no quede desactualizado.
    queryClient.invalidateQueries({ queryKey: ['productos'], exact: false });
  };

  const create = useMutation({
    mutationFn: (payload: CategoriaPayload) => categoriasApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CategoriaPayload> }) =>
      categoriasApi.update(id, payload),
    onSuccess: invalidate,
  });

  const cambiarActivo = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => categoriasApi.cambiarActivo(id, activo),
    onSuccess: invalidate,
  });

  return { create, update, cambiarActivo };
}
