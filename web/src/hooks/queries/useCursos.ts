import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cursoService } from '@/services/curso.service';
import type { Curso, CursoInput } from '@/types';
import { toast } from 'sonner';

export const cursoKeys = {
  all: ['cursos'] as const,
  lists: () => [...cursoKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...cursoKeys.lists(), filters] as const,
  details: () => [...cursoKeys.all, 'detail'] as const,
  detail: (id: number) => [...cursoKeys.details(), id] as const,
};

export function useCursos() {
  return useQuery({
    queryKey: cursoKeys.lists(),
    queryFn: () => cursoService.listarCursos(),
  });
}

export function useCurso(id: number) {
  return useQuery({
    queryKey: cursoKeys.detail(id),
    queryFn: () => cursoService.buscarCurso(id),
    enabled: !!id,
  });
}

export function useCreateCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CursoInput) => cursoService.criarCurso(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cursoKeys.lists() });
      toast.success('Curso criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar curso');
    },
  });
}

export function useUpdateCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CursoInput }) =>
      cursoService.atualizarCurso(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData<Curso>(cursoKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: cursoKeys.lists() });
      toast.success('Curso atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar curso');
    },
  });
}

export function useDeleteCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cursoService.removerCurso(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cursoKeys.lists() });
      toast.success('Curso removido com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao remover curso');
    },
  });
}
