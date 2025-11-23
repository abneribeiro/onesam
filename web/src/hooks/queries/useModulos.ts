import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moduloService, type ModuloInput, type ModuloUpdate, type Modulo } from '@/services/modulo.service';
import { cursoKeys } from './useCursos';
import { toast } from 'sonner';

export const moduloKeys = {
  all: ['modulos'] as const,
  lists: () => [...moduloKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...moduloKeys.lists(), filters] as const,
  byCurso: (cursoId: number) => [...moduloKeys.all, 'curso', cursoId] as const,
  details: () => [...moduloKeys.all, 'detail'] as const,
  detail: (id: number) => [...moduloKeys.details(), id] as const,
};

export function useModulos() {
  return useQuery({
    queryKey: moduloKeys.lists(),
    queryFn: () => moduloService.listarModulos(),
  });
}

export function useModulosPorCurso(cursoId: number, includeAulas: boolean = false) {
  return useQuery({
    queryKey: [...moduloKeys.byCurso(cursoId), { includeAulas }],
    queryFn: () => moduloService.listarModulosPorCurso(cursoId, includeAulas),
    enabled: !!cursoId,
  });
}

export function useModulo(id: number, includeAulas: boolean = false) {
  return useQuery({
    queryKey: [...moduloKeys.detail(id), { includeAulas }],
    queryFn: () => moduloService.obterModulo(id, includeAulas),
    enabled: !!id,
  });
}

export function useCreateModulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ModuloInput) => moduloService.criarModulo(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: moduloKeys.byCurso(variables.IDCurso) });
      queryClient.invalidateQueries({ queryKey: moduloKeys.lists() });
      // Also invalidate the course detail to update module counts
      queryClient.invalidateQueries({ queryKey: cursoKeys.detail(variables.IDCurso) });
      toast.success('Módulo criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar módulo');
    },
  });
}

export function useUpdateModulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ModuloUpdate }) =>
      moduloService.atualizarModulo(id, data),
    onSuccess: (modulo) => {
      queryClient.setQueryData<Modulo>(moduloKeys.detail(modulo.id), modulo);
      queryClient.invalidateQueries({ queryKey: moduloKeys.byCurso(modulo.cursoId) });
      queryClient.invalidateQueries({ queryKey: moduloKeys.lists() });
      // Also invalidate the course detail to update module counts
      queryClient.invalidateQueries({ queryKey: cursoKeys.detail(modulo.cursoId) });
      toast.success('Módulo atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar módulo');
    },
  });
}

export function useDeleteModulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => moduloService.deletarModulo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduloKeys.all });
      // Also invalidate all course details to update module counts
      queryClient.invalidateQueries({ queryKey: cursoKeys.details() });
      toast.success('Módulo removido com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao remover módulo');
    },
  });
}

export function useReordenarModulos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cursoId, modulos }: { cursoId: number; modulos: { id: number; ordem: number }[] }) =>
      moduloService.reordenarModulos(cursoId, modulos),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: moduloKeys.byCurso(variables.cursoId) });
      toast.success('Módulos reordenados com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao reordenar módulos');
    },
  });
}
