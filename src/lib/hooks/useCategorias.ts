import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '../api/categorias';
import type { CategoriaPayload } from '../../types/categoria';

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias-producto'],
    queryFn: categoriasApi.findAll,
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

  const remove = useMutation({
    mutationFn: (id: number) => categoriasApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
