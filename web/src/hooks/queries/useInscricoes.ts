import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { inscricaoService, type InscricaoFiltros } from '@/services/inscricao.service';
import type { InscricaoInput } from '@/types';
import type { PaginationParams } from '@/types/pagination';
import { toast } from 'sonner';

export const inscricaoKeys = {
  all: ['inscricoes'] as const,
  lists: () => [...inscricaoKeys.all, 'list'] as const,
  listsPaginated: (pagination: PaginationParams, filtros?: InscricaoFiltros) =>
    [...inscricaoKeys.all, 'list', 'paginated', pagination, filtros] as const,
  minhas: () => [...inscricaoKeys.all, 'minhas'] as const,
  curso: (cursoId: number) => [...inscricaoKeys.all, 'curso', cursoId] as const,
  detail: (id: number) => [...inscricaoKeys.all, 'detail', id] as const,
};

export function useMinhasInscricoes() {
  return useQuery({
    queryKey: inscricaoKeys.minhas(),
    queryFn: () => inscricaoService.minhasInscricoes(),
  });
}

export function useInscricoesCurso(cursoId: number) {
  return useQuery({
    queryKey: inscricaoKeys.curso(cursoId),
    queryFn: () => inscricaoService.inscritosCurso(cursoId),
    enabled: !!cursoId,
  });
}

export function useTodasInscricoes() {
  return useQuery({
    queryKey: inscricaoKeys.lists(),
    queryFn: () => inscricaoService.listarTodasInscricoes(),
  });
}

export function useTodasInscricoesPaginadas(
  pagination: PaginationParams,
  filtros?: InscricaoFiltros
) {
  return useQuery({
    queryKey: inscricaoKeys.listsPaginated(pagination, filtros),
    queryFn: () => inscricaoService.listarTodasInscricoesPaginadas(pagination, filtros),
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });
}

export function useInscreverCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InscricaoInput) => inscricaoService.inscreverCurso(data),
    onSuccess: () => {
      // Invalidate all inscription queries
      queryClient.invalidateQueries({ queryKey: inscricaoKeys.all });
      toast.success('Inscrição realizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao realizar inscrição');
    },
  });
}

export function useAprovarInscricao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => inscricaoService.aprovarInscricao(id),
    onSuccess: () => {
      // Invalidate all inscription queries (including paginated ones)
      queryClient.invalidateQueries({ queryKey: inscricaoKeys.all });
      toast.success('Inscrição aceite com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao aprovar inscrição');
    },
  });
}

export function useRejeitarInscricao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo?: string }) =>
      inscricaoService.rejeitarInscricao(id, motivo),
    onSuccess: () => {
      // Invalidate all inscription queries (including paginated ones)
      queryClient.invalidateQueries({ queryKey: inscricaoKeys.all });
      toast.success('Inscrição rejeitada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao rejeitar inscrição');
    },
  });
}

export function useCancelarInscricao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => inscricaoService.cancelarInscricao(id),
    onSuccess: () => {
      // Invalidate all inscription queries
      queryClient.invalidateQueries({ queryKey: inscricaoKeys.all });
      toast.success('Inscrição cancelada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao cancelar inscrição');
    },
  });
}

export function useMinhaInscricaoCurso(cursoId: number) {
  return useQuery({
    queryKey: [...inscricaoKeys.minhas(), 'curso', cursoId],
    queryFn: async () => {
      const inscricoes = await inscricaoService.minhasInscricoes();
      return inscricoes.find((i) => i.cursoId === cursoId) || null;
    },
    enabled: !!cursoId,
  });
}
