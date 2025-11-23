import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriaService } from '@/services/categoria.service';
import type { CategoriaBase } from '@/types';
import { toast } from 'sonner';

interface CreateCategoriaInput {
  nome: string;
  descricao?: string;
  IDArea: number;
}

interface UpdateCategoriaInput {
  nome?: string;
  descricao?: string;
  IDArea?: number;
}

export const categoriaKeys = {
  all: ['categorias'] as const,
  lists: () => [...categoriaKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...categoriaKeys.lists(), filters] as const,
  details: () => [...categoriaKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoriaKeys.details(), id] as const,
};

export function useCategorias() {
  return useQuery({
    queryKey: categoriaKeys.lists(),
    queryFn: () => categoriaService.getAll(),
  });
}

export function useCategoria(id: number) {
  return useQuery({
    queryKey: categoriaKeys.detail(id),
    queryFn: () => categoriaService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoriaInput) => categoriaService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriaKeys.lists() });
      toast.success('Categoria criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar categoria');
    },
  });
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoriaInput }) =>
      categoriaService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData<CategoriaBase>(categoriaKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: categoriaKeys.lists() });
      toast.success('Categoria atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar categoria');
    },
  });
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriaKeys.lists() });
      toast.success('Categoria eliminada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao eliminar categoria');
    },
  });
}
