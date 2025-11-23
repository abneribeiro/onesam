import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aulaService, type AulaInput, type AulaUpdate, type Aula } from '@/services/aula.service';
import { moduloKeys } from './useModulos';
import { cursoKeys } from './useCursos';
import { toast } from 'sonner';

export const aulaKeys = {
  all: ['aulas'] as const,
  lists: () => [...aulaKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...aulaKeys.lists(), filters] as const,
  byModulo: (moduloId: number) => [...aulaKeys.all, 'modulo', moduloId] as const,
  details: () => [...aulaKeys.all, 'detail'] as const,
  detail: (id: number) => [...aulaKeys.details(), id] as const,
  progresso: () => [...aulaKeys.all, 'progresso'] as const,
  progressoCurso: (cursoId: number) => [...aulaKeys.progresso(), 'curso', cursoId] as const,
  meuProgresso: () => [...aulaKeys.progresso(), 'meu'] as const,
};

export function useAulas() {
  return useQuery({
    queryKey: aulaKeys.lists(),
    queryFn: () => aulaService.listarAulas(),
  });
}

export function useAulasPorModulo(moduloId: number) {
  return useQuery({
    queryKey: aulaKeys.byModulo(moduloId),
    queryFn: () => aulaService.listarAulasPorModulo(moduloId),
    enabled: !!moduloId,
  });
}

export function useAula(id: number) {
  return useQuery({
    queryKey: aulaKeys.detail(id),
    queryFn: () => aulaService.obterAula(id),
    enabled: !!id,
  });
}

export function useCreateAula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AulaInput) => aulaService.criarAula(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: aulaKeys.byModulo(variables.IDModulo) });
      queryClient.invalidateQueries({ queryKey: aulaKeys.lists() });
      // Also invalidate modules to update lesson counts
      queryClient.invalidateQueries({ queryKey: moduloKeys.all });
      queryClient.invalidateQueries({ queryKey: cursoKeys.details() });
      toast.success('Aula criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar aula');
    },
  });
}

export function useUpdateAula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AulaUpdate }) =>
      aulaService.atualizarAula(id, data),
    onSuccess: (aula) => {
      queryClient.setQueryData<Aula>(aulaKeys.detail(aula.id), aula);
      queryClient.invalidateQueries({ queryKey: aulaKeys.byModulo(aula.moduloId) });
      queryClient.invalidateQueries({ queryKey: aulaKeys.lists() });
      toast.success('Aula atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar aula');
    },
  });
}

export function useDeleteAula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => aulaService.deletarAula(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aulaKeys.all });
      // Also invalidate modules and courses to update lesson counts
      queryClient.invalidateQueries({ queryKey: moduloKeys.all });
      queryClient.invalidateQueries({ queryKey: cursoKeys.details() });
      toast.success('Aula removida com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao remover aula');
    },
  });
}

export function useReordenarAulas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduloId, aulas }: { moduloId: number; aulas: { id: number; ordem: number }[] }) =>
      aulaService.reordenarAulas(moduloId, aulas),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: aulaKeys.byModulo(variables.moduloId) });
      toast.success('Aulas reordenadas com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao reordenar aulas');
    },
  });
}

// === HOOKS DE PROGRESSO ===

export function useMarcarAulaConcluida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ aulaId, tempoGasto }: { aulaId: number; tempoGasto?: number }) =>
      aulaService.marcarAulaConcluida(aulaId, tempoGasto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: aulaKeys.detail(variables.aulaId) });
      queryClient.invalidateQueries({ queryKey: aulaKeys.progresso() });
      toast.success('Aula marcada como concluída!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao marcar aula como concluída');
    },
  });
}

export function useDesmarcarAulaConcluida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (aulaId: number) => aulaService.desmarcarAulaConcluida(aulaId),
    onSuccess: (_, aulaId) => {
      queryClient.invalidateQueries({ queryKey: aulaKeys.detail(aulaId) });
      queryClient.invalidateQueries({ queryKey: aulaKeys.progresso() });
      toast.success('Conclusão da aula removida!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao desmarcar aula');
    },
  });
}

export function useProgressoCurso(cursoId: number) {
  return useQuery({
    queryKey: aulaKeys.progressoCurso(cursoId),
    queryFn: () => aulaService.obterProgressoCurso(cursoId),
    enabled: !!cursoId,
  });
}

export function useMeuProgresso() {
  return useQuery({
    queryKey: aulaKeys.meuProgresso(),
    queryFn: () => aulaService.obterMeuProgresso(),
  });
}
